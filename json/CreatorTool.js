//コピーする関数
async function copyToClipboard(CopiedText){
	try{
		await navigator.clipboard.writeText(CopiedText);
		alert('クリップボードに出力がコピーされました。');
	} catch (err) {
		console.error('コピーに失敗しました: ', err);
	}
}

//生成機クラス
const Generater = {
	StartScrl: 0.0, //開始スクロール速度
	EndScrl: 0.0, //終了スクロール速度
	DivNum: 0, //分割数
	UnitContent: "", //同スクロール速度内の譜面内容
	MeasureLen: 0, //小節辺りのスクロール速度変化数
	MeasureOffset: 0, //小節先頭に対するオフセット
	ResultValue: "", //生成結果
	ErrorCode: [], /*エラーコード（正常だと空配列）
		0：開始スクロール速度がおかしい
		1：終了スクロール速度がおかしい
		2：両端スクロール速度が同じ
		3：分割数がおかしい
		4：同スクロール速度内の譜面内容がおかしい
		5：小節辺りのスクロール速度変化数がおかしい
		6：小節先頭に対するオフセットがおかしい
		*/
	
	//テキストボックスの情報を取得
	readTextBox: function(){
		this.StartScrl = parseFloat(StartScrlElement.value); //開始スクロール速度を取得
		if (isNaN(this.StartScrl) || this.StartScrl=="") this.ErrorCode.push(0); //0より大きい実数でなければエラーコードを格納
		else if (this.StartScrl <= 0) this.ErrorCode.push(0);
	
		this.EndScrl = parseFloat(EndScrlElement.value); //終了スクロール速度を取得
		if (isNaN(this.EndScrl) || this.EndScrl=="") this.ErrorCode.push(1); //0より大きい実数でなければエラーコードを格納
		else if (this.EndScrl <= 0) this.ErrorCode.push(1);
		
		if (this.ErrorCode.length==0){ //両端が同じスクロール速度ならばエラーコードを格納
			if (this.StartScrl==this.EndScrl) this.ErrorCode.push(2);
		}
		
		this.DivNum = parseInt(DivNumElement.value); //分割数を取得
		if (isNaN(this.DivNum) || this.DivNum.toString()!=DivNumElement.value) this.ErrorCode.push(3); //2以上の整数以外が入力されていればエラーコードを格納
		else if (this.DivNum < 2) this.ErrorCode.push(3);
	
		this.UnitContent = UnitContentElement.value; //同スクロール速度内の譜面内容を取得
		if (this.UnitContent == "") this.ErrorCode.push(4);
	
		this.MeasureLen = parseInt(MeasureLenElement.value); //小節辺りのスクロール速度変化数を取得
		if (!this.UnitContent.includes(",")){ //必要ある状況で自然数が入力されていなければエラーコードを格納
			if (isNaN(this.MeasureLen) || this.MeasureLen.toString()!=MeasureLenElement.value) this.ErrorCode.push(5);
			else if (this.MeasureLen < 1) this.ErrorCode.push(5);
		}
		if (this.MeasureLen == "" || this.UnitContent.includes(",")) this.MeasureLen = 1;
		

		this.MeasureOffset = parseInt(MeasureOffsetElement.value); //小節に対するオフセットを取得
		if (!this.UnitContent.includes(",")){ //必要ある状況で整数が入力されていなければエラーコードを格納
			if (isNaN(this.MeasureOffset) || this.MeasureOffset.toString()!=MeasureOffsetElement.value) this.ErrorCode.push(6);
		}
		if (this.MeasureOffset == "" || this.UnitContent.includes(",")) this.MeasureOffset = 0;
	},
	
	//TJAコードを生成
	createTJACode: function(){
		let ScrlProb = Math.pow(this.EndScrl/this.StartScrl, 1/this.DivNum); //変化倍率
		for (let i=0; i<this.DivNum+1; i++){
			let ScrlSpeed = this.StartScrl * Math.pow(ScrlProb, i); //i+1番目のスクロール速度
			let ScrlSpeedRounded = ScrlSpeed.toFixed(3).replace(/(\.\d*?)0+$/, '$1'); //小数第3位まで表示
			ScrlSpeedRounded = ScrlSpeedRounded.replace(/\.$/, '');
			this.ResultValue += "#SCROLL " + ScrlSpeedRounded + "\n" + this.UnitContent;
			if (!this.UnitContent.includes(",") && (i+1+this.MeasureOffset+this.MeasureLen)%this.MeasureLen == 0) this.ResultValue += ",\n"; //小節内の最後の場合、,を追加
			else this.ResultValue += "\n"; //そうでない場合は改行だけ
		}
	},
	
	//エラーを返す
	getErrorValue: function(){
		let ErrorValue = "";
		let ErrorSentence = {
			0: "開始スクロール速度には0より大きい実数を入力してください。",
			1: "終了スクロール速度には0より大きい実数を入力してください。",
			2: "開始・終了スクロール速度は異なる値を入力してください。",
			3: "分割数は2以上の整数を入力してください。",
			4:　"同スクロール速度内の譜面内容が入力されていません。",
			5: "小節辺りのスクロール速度変化数には自然数を入力してください。",
			6:　"小節先頭に対するオフセットには整数を入力してください。"
		}
		for (let i=0; i<this.ErrorCode.length; i++) ErrorValue += (ErrorSentence[this.ErrorCode[i]] + "\n"); //エラー内容を追加
		return ErrorValue;
	},
	
	//生成結果をコピー
	copyResult: function(){
		ResultElement.value = this.ResultValue;
		copyToClipboard(this.ResultValue);
	},

	//Generaterをリセット
	resetGenerater: function(){
		this.StartScrl = 0.0;
		this.EndScrl = 0.0;
		this.DivNum = 0;
		this.UnitContent = "";
		this.MeasureLen = 0;
		this.ResultValue = "";
		this.ErrorCode = [];
	}
}

//生成結果を表示
function showResult(){
	Generater.readTextBox(); //テキストボックスの情報を取得
	if (Generater.ErrorCode.length == 0){
		Generater.createTJACode(); //TJAコードを生成
		ErrorElement.innerText = "";
		Generater.copyResult(); //結果をコピー
	}
	else{ //エラーを表示
		ResultElement.value = "";
		ErrorElement.innerText = Generater.getErrorValue();
	}
	Generater.resetGenerater();
}

//値を取得
let StartScrlElement = document.getElementById("StartScrl");
let EndScrlElement = document.getElementById("EndScrl");
let DivNumElement = document.getElementById("DivNum");
let UnitContentElement = document.getElementById("UnitContent");
let MeasureLenElement = document.getElementById("MeasureLen");
let MeasureOffsetElement = document.getElementById("MeasureOffset");
let ResultElement = document.getElementById("Result");
let ErrorElement = document.getElementById("Error");
let geneButton = document.getElementById("geneButton");

geneButton.addEventListener("click", showResult); //生成結果を表示