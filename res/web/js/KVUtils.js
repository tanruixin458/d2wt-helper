let STATE_NORMAL = 0;
let STATE_COMMENT = 1;
let STATE_KEY = 2;
let STATE_KEY_END = 3;
let STATE_VALUE = 4;
let STATE_VALUE_END = 5;
let STATE_VALUE_LIST = 6;

// @ts-ignore
let vscode = acquireVsCodeApi();

function inArray(value, array) {
	let i = array.length;
	while (i--) {
		if (array[i] === value) {
			break;
		}
	}
	return i;
}

function kvRead(text, startLoc) {
	if(!text) {
		throw "kv字符串为空";
	}

	let _preState = STATE_NORMAL;
	let _state = STATE_NORMAL;
	let _len = text.length;
	let _i, _c, _subKV, _breakFor = false;
	let _startLoc;
	let _endLoc;
	let _comment = "";
	let _key = "";
	let _value = null;

	if(typeof startLoc === "number") {
		_startLoc = startLoc;
	} else {
		_startLoc = undefined;
	}

	function _setState(state) {
		if(_state === state) return;

		_preState = _state;
		_state = state;
	}

	function _matchComment() {
		if(text[_i] === '/' && text[_i + 1] === '/') {
			_i += 1;
			if(text[_i + 1] === ' ') _i += 1;
			return true;
		}
		return false;
	}

	for(_i = _startLoc || 0 ; _i < _len ; _i += 1) {
		_c = text[_i];

		switch(_state) {
		case STATE_NORMAL:
			if(inArray(_c, [' ','\t','\n','\r']) !== -1) continue;

			if(_matchComment()) {
				_setState(STATE_COMMENT);
			} else if(_c === '"') {
				_setState(STATE_KEY);
			} else if(_c === '}' && _startLoc !== undefined) {
				_endLoc = _i;
				_breakFor = true;
			} else {
				vscode.postMessage({
					type: "log",
					log: "[STATE_NORMAL] Not match:'" + _c + "', index:" + _i
				});
			}
			break;

		case STATE_COMMENT:
			if(inArray(_c, ['\n','\r']) !== -1) {
				_comment += "\n";
				_setState(_preState);

				if(_state === STATE_VALUE_END) {
					_endLoc = _i;
					_breakFor = true;
				}
				continue;
			} else {
				_comment += _c;
			}
			break;

		case STATE_KEY:
			if(_c === '"') {
				_setState(STATE_KEY_END);
			} else {
				_key += _c;
			}
			break;

		case STATE_KEY_END:
			if(inArray(_c, [' ','\t','\n','\r']) !== -1) continue;

			if(_matchComment()) {
				_setState(STATE_COMMENT);
			} else if(_c === '"') {
				_value = "";
				_setState(STATE_VALUE);
			} else if(_c === '{') {
				_value = [];
				_setState(STATE_VALUE_LIST);
			} else {
				vscode.postMessage({
					type: "log",
					log: "[STATE_KEY_END] Not match:'" + _c + "', index:" + _i
				});
			}
			break;

		case STATE_VALUE:
			if(_c === '"') {
				_setState(STATE_VALUE_END);
				_endLoc = _i;
			} else if(_c === '\\') {
				_i += 1;
				_value += '\\' + text[_i];
			} else {
				_value += _c;
			}
			break;

		case STATE_VALUE_LIST:
			if(_c === "}") {
				_setState(STATE_VALUE_END);
				_endLoc = _i;
			} else {
				_subKV = kvRead(text, _i + 1);
				if (_subKV.kv) {
					_value.push(_subKV.kv);
				} else {
					_setState(STATE_VALUE_END);
					_endLoc = _subKV.endLoc;
				}
				_i = _subKV.endLoc;
			}
			break;

		case STATE_VALUE_END:
			if(inArray(_c, [' ','\t']) !== -1) continue;
			if(_matchComment()) {
				_setState(STATE_COMMENT);
			} else {
				_breakFor = true;
			}
			break;
		}

		if(_breakFor) break;
	}

	var _kv = new KV(_key, _value, _comment.replace(/[\r\n]+$/, ""));

	if(_startLoc === undefined) {
		return _kv;
	} else {
		return {
			kv: _value !== null ? _kv : null,
			startLoc: _startLoc,
			endLoc: _endLoc
		};
	}
}

function kvWrite() {
	
}