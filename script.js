/* ===================== Tabs ===================== */

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');
        panels.forEach(p => p.classList.remove('active-panel'));
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active-panel');
        if(tab.dataset.tab === 'graph') drawGraph();
    });
});

/* ===================== Theme picker ===================== */

document.querySelectorAll('.theme-picker .swatch').forEach(sw => {
    sw.addEventListener('click', () => {
        document.body.setAttribute('data-theme', sw.dataset.theme);
        drawGraph();
    });
});

/* ===================== Ripple effect ===================== */

function attachRipple(btn){
    btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });
}

/* ===================== Safe expression parser (no eval) ===================== */

const FUNCTIONS = new Set(['sin','cos','tan','sqrt','log','ln','fact']);
const PRECEDENCE = { '+':2, '-':2, '*':3, '/':3, 'u-':4, '^':5 };
const RIGHT_ASSOC = new Set(['^','u-']);

function tokenize(str){
    const out = [];
    let i = 0;
    while(i < str.length){
        const ch = str[i];
        if(ch === ' '){ i++; continue; }
        if(/[0-9.]/.test(ch)){
            let num = '';
            while(i < str.length && /[0-9.]/.test(str[i])){ num += str[i]; i++; }
            if((num.match(/\./g) || []).length > 1) throw new Error('Invalid number');
            out.push({ type: 'num', value: parseFloat(num) });
            continue;
        }
        if(/[a-z]/i.test(ch)){
            let word = '';
            while(i < str.length && /[a-z]/i.test(str[i])){ word += str[i]; i++; }
            if(word === 'pi'){ out.push({ type: 'num', value: Math.PI }); }
            else if(word === 'e'){ out.push({ type: 'num', value: Math.E }); }
            else if(word === 'x'){ out.push({ type: 'var', value: 'x' }); }
            else if(FUNCTIONS.has(word)){ out.push({ type: 'func', value: word }); }
            else throw new Error('Unknown token: ' + word);
            continue;
        }
        if('+-*/^()'.includes(ch)){
            out.push({ type: (ch === '(' ? 'lparen' : ch === ')' ? 'rparen' : 'op'), value: ch });
            i++;
            continue;
        }
        throw new Error('Unexpected character: ' + ch);
    }
    return out;
}

function toRPN(rawTokens){
    const output = [];
    const stack = [];
    let prev = null;

    for(const tok of rawTokens){
        if(tok.type === 'num' || tok.type === 'var'){
            output.push(tok);
        } else if(tok.type === 'func'){
            stack.push(tok);
        } else if(tok.type === 'op'){
            let opVal = tok.value;
            const isUnary = (opVal === '-') && (prev === null || prev.type === 'op' || prev.type === 'lparen');
            if(isUnary) opVal = 'u-';
            while(stack.length){
                const top = stack[stack.length - 1];
                if(top.type === 'op' &&
                   ((RIGHT_ASSOC.has(opVal) ? PRECEDENCE[top.value] > PRECEDENCE[opVal] : PRECEDENCE[top.value] >= PRECEDENCE[opVal]))){
                    output.push(stack.pop());
                } else break;
            }
            stack.push({ type: 'op', value: opVal });
        } else if(tok.type === 'lparen'){
            stack.push(tok);
        } else if(tok.type === 'rparen'){
            while(stack.length && stack[stack.length - 1].type !== 'lparen'){
                output.push(stack.pop());
            }
            if(!stack.length) throw new Error('Mismatched parentheses');
            stack.pop();
            if(stack.length && stack[stack.length - 1].type === 'func'){
                output.push(stack.pop());
            }
        }
        prev = tok;
    }
    while(stack.length){
        const top = stack.pop();
        if(top.type === 'lparen') throw new Error('Mismatched parentheses');
        output.push(top);
    }
    return output;
}

function factorial(n){
    if(n < 0 || !Number.isInteger(n)) throw new Error('Factorial needs a non-negative integer');
    if(n > 170) throw new Error('Number too large');
    let r = 1;
    for(let k = 2; k <= n; k++) r *= k;
    return r;
}

const UNARY_FUNCS = {
    sin: (x) => Math.sin(x * Math.PI / 180),
    cos: (x) => Math.cos(x * Math.PI / 180),
    tan: (x) => Math.tan(x * Math.PI / 180),
    sqrt: (x) => { if(x < 0) throw new Error('Invalid input for √'); return Math.sqrt(x); },
    log: (x) => { if(x <= 0) throw new Error('Invalid input for log'); return Math.log10(x); },
    ln: (x) => { if(x <= 0) throw new Error('Invalid input for ln'); return Math.log(x); },
    fact: factorial
};

function evalRPN(rpn, env){
    env = env || {};
    const stack = [];
    for(const tok of rpn){
        if(tok.type === 'num'){
            stack.push(tok.value);
        } else if(tok.type === 'var'){
            if(!(tok.value in env)) throw new Error('"' + tok.value + '" is not defined');
            stack.push(env[tok.value]);
        } else if(tok.type === 'func'){
            if(stack.length < 1) throw new Error('Invalid expression');
            const a = stack.pop();
            stack.push(UNARY_FUNCS[tok.value](a));
        } else if(tok.type === 'op'){
            if(tok.value === 'u-'){
                if(stack.length < 1) throw new Error('Invalid expression');
                stack.push(-stack.pop());
                continue;
            }
            if(stack.length < 2) throw new Error('Invalid expression');
            const b = stack.pop();
            const a = stack.pop();
            switch(tok.value){
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/':
                    if(b === 0) throw new Error('Cannot divide by zero');
                    stack.push(a / b);
                    break;
                case '^': stack.push(Math.pow(a, b)); break;
                default: throw new Error('Unknown operator');
            }
        }
    }
    if(stack.length !== 1) throw new Error('Invalid expression');
    const result = stack[0];
    if(!isFinite(result)) throw new Error('Result is not a finite number');
    return result;
}

function safeEvaluate(str, env){
    if(!str.trim()) throw new Error('Nothing to calculate');
    const raw = tokenize(str);
    const rpn = toRPN(raw);
    const result = evalRPN(rpn, env);
    return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
}

/* ===================== Calculator state & UI ===================== */

const inputBox    = document.getElementById('inputBox');
const expressionEl= document.getElementById('expression');
const errorEl     = document.getElementById('errorMsg');
const historyList = document.getElementById('historyList');
const historyPanel= document.getElementById('historyPanel');
const memIndicator= document.getElementById('memIndicator');
const sciRow      = document.getElementById('sciRow');

let tokens = [];
let justEvaluated = false;
let memoryValue = 0;
let history = [];

const DISPLAY_MAP = { '*': '\u00d7', '/': '\u00f7', '-': '\u2212', 'pi': '\u03c0' };
const OPERATORS = ['+','-','*','/','^'];
const isDigit = (s) => /^[0-9]$/.test(s);
const isNumberToken = (t) => t !== undefined && /^[0-9.]+$/.test(t);
const lastToken = () => tokens[tokens.length - 1];

function renderExpression(){
    expressionEl.innerHTML = tokens.length === 0 ? '&nbsp;' : tokens.map(t => DISPLAY_MAP[t] || t).join(' ');
}
function setResult(text){ inputBox.value = text; }
function clearError(){ errorEl.textContent = ''; }
function showError(msg){ errorEl.textContent = msg; setResult('Error'); }

function liveDisplayNumber(){
    const last = lastToken();
    return isNumberToken(last) ? last : (inputBox.value || '0');
}

function appendDigit(d){
    clearError();
    if(justEvaluated){ tokens = []; justEvaluated = false; }
    const last = lastToken();
    if(last !== undefined && isNumberToken(last)) tokens[tokens.length - 1] = last + d;
    else tokens.push(d);
    renderExpression();
    setResult(liveDisplayNumber());
}

function appendDecimal(){
    clearError();
    if(justEvaluated){ tokens = []; justEvaluated = false; }
    const last = lastToken();
    if(last !== undefined && isNumberToken(last)){ if(!last.includes('.')) tokens[tokens.length - 1] = last + '.'; }
    else tokens.push('0.');
    renderExpression();
    setResult(lastToken());
}

function appendOperator(op){
    clearError();
    if(justEvaluated){ justEvaluated = false; }
    const last = lastToken();
    if(last === undefined){
        if(op === '-'){ tokens.push('-'); renderExpression(); }
        return;
    }
    if(OPERATORS.includes(last) && op !== '-') tokens[tokens.length - 1] = op;
    else tokens.push(op);
    renderExpression();
}

function appendFunction(fn){
    clearError();
    if(justEvaluated){ tokens = []; justEvaluated = false; }
    tokens.push(fn);
    renderExpression();
}

function appendParen(p){
    clearError();
    if(justEvaluated && p === '('){ tokens = []; justEvaluated = false; }
    tokens.push(p);
    renderExpression();
}

function appendConstant(c){
    clearError();
    if(justEvaluated){ tokens = []; justEvaluated = false; }
    tokens.push(c);
    renderExpression();
    setResult(c === 'pi' ? '\u03c0' : c);
}

function applyPercent(){
    clearError();
    const last = lastToken();
    if(isNumberToken(last)){
        tokens[tokens.length - 1] = '(' + last + '/100)';
        renderExpression();
        setResult(String(Number(last) / 100));
    }
}

function applyFactorial(){
    clearError();
    const last = lastToken();
    if(isNumberToken(last)){
        tokens[tokens.length - 1] = 'fact(' + last + ')';
        renderExpression();
    }
}

function clearAll(){
    tokens = []; justEvaluated = false; clearError(); renderExpression(); setResult('0');
}

function deleteToken(){
    clearError();
    if(tokens.length === 0) return;
    const last = lastToken();
    if(last.length > 1 && !/^[a-z]+\($/.test(last)) tokens[tokens.length - 1] = last.slice(0, -1);
    else tokens.pop();
    renderExpression();
    setResult(tokens.length ? liveDisplayNumber() : '0');
}

function equals(){
    if(tokens.length === 0) return;
    const exprString = tokens.join('');
    try{
        const result = safeEvaluate(exprString);
        addHistory(tokens.map(t => DISPLAY_MAP[t] || t).join(' '), String(result));
        tokens = [String(result)];
        justEvaluated = true;
        renderExpression();
        setResult(String(result));
        clearError();
    } catch(err){
        showError(err.message || 'Invalid expression');
    }
}

/* ---------- History ---------- */

function addHistory(expr, result){
    history.unshift({ expr, result });
    if(history.length > 30) history.pop();
    renderHistory();
}
function renderHistory(){
    historyList.innerHTML = history.length === 0
        ? '<li class="empty">No calculations yet</li>'
        : history.map((h, idx) => `<li data-idx="${idx}"><div class="h-expr">${h.expr}</div><div class="h-result">= ${h.result}</div></li>`).join('');
}
historyList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-idx]');
    if(!li) return;
    const item = history[Number(li.dataset.idx)];
    tokens = [item.result];
    justEvaluated = true;
    renderExpression();
    setResult(item.result);
    clearError();
});
document.getElementById('clearHistory').addEventListener('click', () => { history = []; renderHistory(); });
document.getElementById('historyToggle').addEventListener('click', () => historyPanel.classList.toggle('open'));

/* ---------- Memory ---------- */

function updateMemIndicator(){ memIndicator.textContent = memoryValue !== 0 ? 'M: ' + memoryValue : ''; }
document.querySelectorAll('.mem-btn').forEach(btn => {
    attachRipple(btn);
    btn.addEventListener('click', () => {
        const action = btn.dataset.mem;
        const current = parseFloat(inputBox.value);
        if(action === 'MC'){ memoryValue = 0; }
        else if(action === 'MR'){
            if(justEvaluated){ tokens = []; justEvaluated = false; }
            tokens.push(String(memoryValue));
            renderExpression();
            setResult(String(memoryValue));
        }
        else if(action === 'M+'){ if(!isNaN(current)) memoryValue += current; }
        else if(action === 'M-'){ if(!isNaN(current)) memoryValue -= current; }
        updateMemIndicator();
    });
});

/* ---------- Scientific toggle ---------- */

const basicModeBtn = document.getElementById('basicModeBtn');
const sciModeBtn = document.getElementById('sciModeBtn');
function setMode(sci){
    sciRow.classList.toggle('open', sci);
    sciModeBtn.classList.toggle('active', sci);
    basicModeBtn.classList.toggle('active', !sci);
    sciModeBtn.setAttribute('aria-selected', String(sci));
    basicModeBtn.setAttribute('aria-selected', String(!sci));
}
basicModeBtn.addEventListener('click', () => setMode(false));
sciModeBtn.addEventListener('click', () => setMode(true));

/* ---------- Copy result ---------- */

document.getElementById('copyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('copyBtn');
    const text = inputBox.value || '0';
    try{ await navigator.clipboard.writeText(text); }
    catch(e){
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
    }
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 900);
});

/* ---------- Button wiring ---------- */

document.querySelectorAll('.btn-grid button, .sci-row button').forEach(btn => {
    attachRipple(btn);
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const val = btn.dataset.val;
        if(action === 'clear'){ clearAll(); return; }
        if(action === 'del'){ deleteToken(); return; }
        if(action === 'equals'){ equals(); return; }
        if(val === undefined) return;
        if(isDigit(val) || val === '00'){ appendDigit(val); return; }
        if(val === '.'){ appendDecimal(); return; }
        if(val === '%'){ applyPercent(); return; }
        if(val === '!'){ applyFactorial(); return; }
        if(val === '('){ appendParen('('); return; }
        if(val === ')'){ appendParen(')'); return; }
        if(val === 'pi' || val === 'e'){ appendConstant(val); return; }
        if(['sin(','cos(','tan(','sqrt(','log(','ln('].includes(val)){ appendFunction(val); return; }
        if(OPERATORS.includes(val)){ appendOperator(val); return; }
    });
});

/* ---------- Keyboard support (calculator tab only) ---------- */

window.addEventListener('keydown', (e) => {
    if(!document.getElementById('panel-calc').classList.contains('active-panel')) return;
    const key = e.key;
    if(/^[0-9]$/.test(key)){ appendDigit(key); return; }
    if(key === '.'){ appendDecimal(); return; }
    if(['+','-','*','/','^'].includes(key)){ appendOperator(key); return; }
    if(key === '('){ appendParen('('); return; }
    if(key === ')'){ appendParen(')'); return; }
    if(key === '%'){ applyPercent(); return; }
    if(key === 'Enter' || key === '='){ e.preventDefault(); equals(); return; }
    if(key === 'Backspace'){ deleteToken(); return; }
    if(key === 'Escape'){ clearAll(); return; }
});

/* ===================== Graph module ===================== */

const graphFnInput = document.getElementById('graphFn');
const graphCanvas = document.getElementById('graphCanvas');
const graphError = document.getElementById('graphError');
const rangeLabel = document.getElementById('rangeLabel');
let graphRange = 10;

function cssVar(name){ return getComputedStyle(document.body).getPropertyValue(name).trim(); }

function drawGraph(){
    if(!graphCanvas.getContext) return;
    const ctx = graphCanvas.getContext('2d');
    const w = graphCanvas.width, h = graphCanvas.height;
    ctx.clearRect(0, 0, w, h);
    graphError.textContent = '';

    const fnStr = graphFnInput.value.trim() || '0';
    let raw, rpn;
    try{ raw = tokenize(fnStr); rpn = toRPN(raw); }
    catch(err){ graphError.textContent = err.message; return; }

    const xMin = -graphRange, xMax = graphRange;
    const steps = 300;
    const points = [];
    for(let i = 0; i <= steps; i++){
        const x = xMin + (xMax - xMin) * (i / steps);
        try{
            const y = evalRPN(rpn, { x });
            points.push({ x, y: isFinite(y) ? y : null });
        } catch(err){
            points.push({ x, y: null });
        }
    }
    const validYs = points.map(p => p.y).filter(y => y !== null);
    if(validYs.length === 0){ graphError.textContent = 'Nothing plottable in this range'; return; }
    let yMin = Math.min(...validYs), yMax = Math.max(...validYs);
    if(yMin === yMax){ yMin -= 1; yMax += 1; }
    const pad = (yMax - yMin) * 0.1;
    yMin -= pad; yMax += pad;

    const toPx = (x, y) => [
        ((x - xMin) / (xMax - xMin)) * w,
        h - ((y - yMin) / (yMax - yMin)) * h
    ];

    const gridColor = 'rgba(255,255,255,0.08)';
    const axisColor = 'rgba(255,255,255,0.25)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for(let gx = Math.ceil(xMin); gx <= xMax; gx++){
        const [px] = toPx(gx, 0);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
    }
    const yStep = (yMax - yMin) / 8;
    for(let i = 0; i <= 8; i++){
        const gy = yMin + i * yStep;
        const [, py] = toPx(0, gy);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
    }
    if(yMin < 0 && yMax > 0){
        ctx.strokeStyle = axisColor;
        const [, py0] = toPx(0, 0);
        ctx.beginPath(); ctx.moveTo(0, py0); ctx.lineTo(w, py0); ctx.stroke();
    }
    if(xMin < 0 && xMax > 0){
        ctx.strokeStyle = axisColor;
        const [px0] = toPx(0, 0);
        ctx.beginPath(); ctx.moveTo(px0, 0); ctx.lineTo(px0, h); ctx.stroke();
    }

    ctx.strokeStyle = cssVar('--accent') || '#ffb454';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let drawing = false;
    for(const p of points){
        if(p.y === null){ drawing = false; continue; }
        const [px, py] = toPx(p.x, p.y);
        if(!drawing){ ctx.moveTo(px, py); drawing = true; }
        else ctx.lineTo(px, py);
    }
    ctx.stroke();

    rangeLabel.textContent = `x: ${xMin} to ${xMax}`;
}

let graphDebounce;
graphFnInput.addEventListener('input', () => {
    clearTimeout(graphDebounce);
    graphDebounce = setTimeout(drawGraph, 200);
});
document.getElementById('zoomIn').addEventListener('click', () => { graphRange = Math.max(2, graphRange / 2); drawGraph(); });
document.getElementById('zoomOut').addEventListener('click', () => { graphRange = Math.min(200, graphRange * 2); drawGraph(); });

/* ===================== Converter module ===================== */

const UNIT_GROUPS = {
    length: { base: 'm', units: { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.344, yd:0.9144, ft:0.3048, in:0.0254 } },
    weight: { base: 'kg', units: { kg:1, g:0.001, mg:0.000001, lb:0.45359237, oz:0.0283495231, ton:1000 } },
    area: { base: 'm2', units: { m2:1, km2:1000000, ha:10000, ft2:0.09290304, acre:4046.8564224 } },
    speed: { base: 'mps', units: { mps:1, kmh:0.277778, mph:0.44704, knot:0.514444 } },
    data: { base: 'byte', units: { byte:1, KB:1024, MB:1024**2, GB:1024**3, TB:1024**4, bit:0.125 } }
};

const convCategory = document.getElementById('convCategory');
const convFromUnit = document.getElementById('convFromUnit');
const convToUnit = document.getElementById('convToUnit');
const convFromValue = document.getElementById('convFromValue');
const convToValue = document.getElementById('convToValue');
const convError = document.getElementById('convError');

function populateUnitSelects(){
    const cat = convCategory.value;
    convFromUnit.innerHTML = '';
    convToUnit.innerHTML = '';
    if(cat === 'temperature'){
        ['C','F','K'].forEach(u => {
            convFromUnit.add(new Option(u, u));
            convToUnit.add(new Option(u, u));
        });
        convToUnit.value = 'F';
    } else {
        const units = Object.keys(UNIT_GROUPS[cat].units);
        units.forEach(u => {
            convFromUnit.add(new Option(u, u));
            convToUnit.add(new Option(u, u));
        });
        convToUnit.value = units[1] || units[0];
    }
    runConversion();
}

function toCelsius(v, from){
    if(from === 'C') return v;
    if(from === 'F') return (v - 32) * 5 / 9;
    if(from === 'K') return v - 273.15;
}
function fromCelsius(c, to){
    if(to === 'C') return c;
    if(to === 'F') return c * 9 / 5 + 32;
    if(to === 'K') return c + 273.15;
}

function runConversion(){
    convError.textContent = '';
    const cat = convCategory.value;
    const rawVal = parseFloat(convFromValue.value);
    if(isNaN(rawVal)){ convToValue.value = ''; convError.textContent = 'Enter a valid number'; return; }

    let result;
    if(cat === 'temperature'){
        const c = toCelsius(rawVal, convFromUnit.value);
        result = fromCelsius(c, convToUnit.value);
    } else {
        const group = UNIT_GROUPS[cat].units;
        const baseVal = rawVal * group[convFromUnit.value];
        result = baseVal / group[convToUnit.value];
    }
    convToValue.value = Math.round((result + Number.EPSILON) * 1e8) / 1e8;
}

convCategory.addEventListener('change', populateUnitSelects);
convFromUnit.addEventListener('change', runConversion);
convToUnit.addEventListener('change', runConversion);
convFromValue.addEventListener('input', runConversion);
document.getElementById('convSwap').addEventListener('click', () => {
    const tmpUnit = convFromUnit.value;
    convFromUnit.value = convToUnit.value;
    convToUnit.value = tmpUnit;
    convFromValue.value = convToValue.value || convFromValue.value;
    runConversion();
});

populateUnitSelects();

/* ===================== Programmer module ===================== */

const progInput = document.getElementById('progInput');
const progBase = document.getElementById('progBase');
const progError = document.getElementById('progError');
const outDec = document.getElementById('outDec');
const outBin = document.getElementById('outBin');
const outOct = document.getElementById('outOct');
const outHex = document.getElementById('outHex');

function updateProgReadouts(){
    progError.textContent = '';
    const base = parseInt(progBase.value, 10);
    const raw = progInput.value.trim();
    if(raw === ''){ outDec.textContent = outBin.textContent = outOct.textContent = outHex.textContent = '0'; return; }
    const value = parseInt(raw, base);
    if(isNaN(value) || value < 0){
        progError.textContent = 'Enter a valid non-negative ' + progBase.selectedOptions[0].text.toLowerCase() + ' value';
        return;
    }
    outDec.textContent = value.toString(10);
    outBin.textContent = value.toString(2);
    outOct.textContent = value.toString(8);
    outHex.textContent = value.toString(16).toUpperCase();
}
progInput.addEventListener('input', updateProgReadouts);
progBase.addEventListener('change', updateProgReadouts);

const bitA = document.getElementById('bitA');
const bitB = document.getElementById('bitB');
const bitOp = document.getElementById('bitOp');
const bitResult = document.getElementById('bitResult');

function updateBitwise(){
    const a = parseInt(bitA.value, 10);
    const b = parseInt(bitB.value, 10);
    const op = bitOp.value;
    if(isNaN(a) || (op !== 'NOT' && isNaN(b))){ bitResult.textContent = '= —'; return; }
    let result;
    switch(op){
        case 'AND': result = a & b; break;
        case 'OR': result = a | b; break;
        case 'XOR': result = a ^ b; break;
        case 'NOT': result = ~a; break;
        case '<<': result = a << b; break;
        case '>>': result = a >> b; break;
    }
    bitResult.textContent = `= ${result}  (0b${(result >>> 0).toString(2)}, 0x${(result >>> 0).toString(16).toUpperCase()})`;
}
[bitA, bitB, bitOp].forEach(el => el.addEventListener('input', updateBitwise));
bitOp.addEventListener('change', updateBitwise);

/* ===================== Init ===================== */

clearAll();
updateMemIndicator();
renderHistory();
updateProgReadouts();
updateBitwise();