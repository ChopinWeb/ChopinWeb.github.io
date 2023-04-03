//左端に連続するノーツ数以外の数字の数を返す
function getLeftNonNote(s){
	new_s = s.replaceAll(/\s+|,/g,""); //sから空白とコンマを取り除く
	for (let i=0; i<new_s.length; i++){
		if (/[1-4]/.test(new_s.charAt(i))) return i; //1から4のどれかであればそれ以前の数字の数を返す
	}
	return -1; //1から4がなければ-1を返す
}

//右端に連続するノーツ数以外の数字の数を返す
function getRightNonNote(s){
	new_s = s.replaceAll(/\s+|,/g,""); //sから空白とコンマを取り除く
	for (let i=new_s.length-1; i>-1; i--){
		if (/[1-4]/.test(new_s.charAt(i))) return new_s.length - i -1; //1から4のどれかであればそれ以降の数字の数を返す
	}
	return -1; //1から4がなければ-1を返す
}

//計算機クラス
const Calclator = {
	course: "", //難易度
	StartMeasure: 0, //開始小節
	EndMeasure: 0, //終了小節
	ScoreArray: [], //TJAファイルの内容を行ごとに格納したもの
	combo: 0, //コンボ数
	second: 0, //曲の秒数
	ErrorCode: [], /*エラーコード（正常だと空配列）
		1：ファイル読み取り不可
		2：TJAコードがない
		3：難易度が指定されていない
		4：指定難易度がない
		5：開始小節の文法がおかしい
		6：終了小節の文法がおかしい
		7：コンボ数が2未満
		8：バグ発生*/
	
	//ファイル読み込み
	readFile: function(){
		if (TJAFile.files.length == 0) this.ScoreArray = []; //ファイルがない場合はScoreArrayを空にする
		else { //ファイルが存在するとき
			let file_reader = new FileReader();
			file_reader.onload = (e) => this.ScoreArray = file_reader.result.split(/\r\n|\n/);
			file_reader.readAsText(TJAFile.files[0], "Shift_JIS"); //Shift_JISでファイルを読み取り
		}
	},
	
	//テキストエリアの中身を取得
	getTextareaContent: function(){
		if (TJAFile.files.length == 0){ //ファイルが選択されていないときのみ実行
			if (TJATextarea.value == "") this.ErrorCode.push(2); //テキストエリアも空ならば、TJAが存在しないエラーコードを格納
			else this.ScoreArray = TJATextarea.value.split(/\r\n|\n/); //そうでなければテキストエリアの情報を読み取り
		}
	},
	
	//テキストボックスの情報を取得
	readTextBox: function(){
		this.course = CourseElement.value; //難易度を取得
		if (this.course == "Unselect") this.ErrorCode.push(3); //未選択ならばエラーコードを格納
		
		if (/^(最初|[0-9]+)$/.test(StartMeasureElement.value)){ //開始小節の文法が正しければ値を取得
			if (StartMeasureElement.value == "最初") this.StartMeasure = 1;
			else this.StartMeasure = parseInt(StartMeasureElement.value);
		}
		else this.ErrorCode.push(5); //正しくなければエラーコードを格納
		
		if (/^(最後|[0-9]+)$/.test(EndMeasureElement.value)){ //終了小節の文法が正しければ値を取得
			if (EndMeasureElement.value == "最後") this.EndMeasure = Number.POSITIVE_INFINITY;
			else this.EndMeasure = parseInt(EndMeasureElement.value);
		}
		else this.ErrorCode.push(6); //正しくなければエラーコードを格納
	},
	
	//平均密度を計算
	calclateMeanDensity: function(){
		if (this.ErrorCode.length != 0) return; //既にエラーがあればスキップ
		let BPM = 120; //BPM
		let BeatNum = 4; //一小節当たりの拍数
		let flg = 0; /*読み取り場所に関するフラグ
			初期値0
			指定の難易度に入ったら1
			#STARTが出てきたら2
			ノーツが始まったら3
			2小節目以降は4
			ノーツが存在する最後の行であれば5or6（2小節以上あるときは5、そうでないときは6）*/
		let RowInfo = []; /*行ごとの情報
			LetterNum：全数字数
			NoteNum：うちノーツ数
			RowBPM：その行でのBPM*/
		let MeasureInfo = []; /*小節ごとの情報
			NoteNum：ノーツ数
			Second：秒数*/
		let FirstNonNote; //開始小節の始端に連続するノーツ以外の数字の数
		let LastNonNote; //終了小節の終端に連続するノーツ以外の数字の数
		let EndRow; //終了小節の何行目でノーツが終わるか
		
		CourseDic = {"Edit":["EDIT", "4"], "Oni":["ONI", "3"], "Hard":["HARD", "2"], "Normal":["NORMAL", "1"], "Easy":["EASY", "0"]};
		SelectedCourse = CourseDic[this.course].concat([this.course]); //指定の難易度に該当する配列を作成
		
		for (let i=0; i<this.ScoreArray.length; i++){
			if (this.ScoreArray[i].includes("//")) this.ScoreArray[i] = this.ScoreArray[i].split("//")[0]; //前処理（コメント消去）
			
			//指定の難易度の"#START"が現れるまでスキップ
			if (flg <= 1){
				if (this.ScoreArray[i].includes("BPM:")) BPM = parseFloat(this.ScoreArray[i].split(":")[1].trim()) //最初のBPM宣言
				else if (this.ScoreArray[i].includes("COURSE:") && SelectedCourse.includes(this.ScoreArray[i].split(":")[1].trim())) flg = 1; //難易度宣言
				else if (this.ScoreArray[i].includes("#START") && flg == 1) flg = 2; //その難易度下での"#START"
				continue;
			}
			
			//BPM・拍子の切り替わり
			else if (this.ScoreArray[i].includes("#BPMCHANGE")) BPM = parseFloat(this.ScoreArray[i].split("#BPMCHANGE")[1].trim()); //BPM
			else if (this.ScoreArray[i].includes("#MEASURE")){ //拍子
				MeasureStr = this.ScoreArray[i].split("#MEASURE")[1].trim().split("/");
				BeatNum = 4 * parseFloat(MeasureStr[0]) / parseFloat(MeasureStr[1]);
			}
			
			//ノーツ入力
			else if (!(this.ScoreArray[i].includes("#"))){
				if (flg == 2 && this.StartMeasure-1 <= MeasureInfo.length){ //開始小節に入ったら（最初のノーツは未走査）
					let LeftNonNote = getLeftNonNote(this.ScoreArray[i]); //左端に連続するノーツ以外の数字の数
					if (LeftNonNote != -1){ //ノーツの始まり
						if (RowInfo.length == 0) FirstNonNote = LeftNonNote; //開始小節の1行目からノーツがあるとき
						else FirstNonNote =  RowInfo.reduce((sum, element) => sum + element.LetterNum, 0) + LeftNonNote; //開始小節の1行目にノーツがないとき
						flg = 3;
					}
				}
				RowInfo.push({
					LetterNum:this.ScoreArray[i].replaceAll(/\s+|,/g,"").length,
					NoteNum:this.ScoreArray[i].split("").filter(element => /[1-4]/.test(element)).length,
					RowBPM:BPM
				})
			}

			//終了タイミングに関する判定（flg>=5の時は重複走査なので除外）
			if (flg <= 4){
				if (this.EndMeasure == MeasureInfo.length+1){ //指定の終了小節に達したら，コンマのある行の下を"#END"にする
					for (let j=i; j<this.ScoreArray.length; j++){
						if (this.ScoreArray[j].includes(",")){
							this.ScoreArray[j+1] = "#END";
							break;
						}
					}
				}
				for (let j=i+1; j<this.ScoreArray.length; j++){ //今の行が最終行かどうかを判定
					if (this.ScoreArray[j].includes("#END")){ //"#END"の行
						LastNonNote = getRightNonNote(this.ScoreArray[i]); //右端に連続するノーツ以外の数字の数
						EndRow = RowInfo.length - 1; //その小節の何行目でノーツが終わるか
						flg = flg==4 ? 5 : 6;
						break;
					}
					else if (/[1-4]/.test(this.ScoreArray[j]) && !(this.ScoreArray[j].includes("#"))) break; //ノーツがあればスキップ
				}
			}
			
			//小節終わり
			if (this.ScoreArray[i].includes(",") && flg >= 2){
				let note = flg>=3 ? RowInfo.reduce((sum, element) => sum + element.NoteNum, 0) : 0; //小節中のノーツ数
				let AllNum = RowInfo.reduce((sum, element) => sum + element.LetterNum, 0); //小節中の全数字数
				let t = 0; //小節の秒数
				let tmpBeatNum;
				
				//ノーツの始まる小節
				if (flg == 3 || flg == 6){
					tmpBeatNum = BeatNum;
					BeatNum *= (1 - FirstNonNote / AllNum); //最初のノーツから始まる拍子に設定
				}
				
				//ノーツが終わる小節
				if (flg >= 5){
					if (EndRow != RowInfo.length-1){ //最後の行以外で終わっていれば
						LastNonNote += RowInfo.slice(EndRow+1, RowInfo.length).reduce((sum, element) => sum + element.LetterNum, 0);
					}
					BeatNum *= (1 - (LastNonNote+1) / (AllNum-FirstNonNote)) //最後のノーツで終わる拍子に設定
				}
				
				//最初のノーツ以降
				if (flg >= 3){
						t = AllNum!=0 ? RowInfo.reduce((sum, element) => sum + BeatNum * (element.LetterNum/AllNum) * (60/element.RowBPM), 0) : BeatNum * (60/BPM) //秒数を計測
				}
				
				//最初のノーツの行
				if (flg == 3){
					BeatNum = tmpBeatNum;
					FirstNonNote = 0;
					flg = 4;
				}
				MeasureInfo.push({NoteNum:note, Second:t}) //MeasureInfoに小節の情報を追加
				RowInfo = [];
				if (flg >= 5) break; //処理を終了
			}
		}
		
		//平均密度の計算
		if (flg == 0) { //指定の難易度が存在しないとき
			this.ErrorCode.push(4);
			return;
		}
		let ComboSum = MeasureInfo.reduce((sum, element) => sum + element.NoteNum, 0); //コンボ数
		if (ComboSum < 2) this.ErrorCode.push(7); //コンボ数が足りないとき
		else{ //コンボ数と曲の秒数を格納
			this.combo = ComboSum;
			this.second = MeasureInfo.reduce((sum, element) => sum + element.Second, 0);
		}
	},
	
	//表示結果の中身を返す
	getResultValue: function(){
		let ResultValue = "";	
		if (this.ErrorCode.length == 0){ //エラーがない場合
			ResultValue += "コンボ数は" + (this.combo).toString() + "です。\n";
			ResultValue += "秒数は" + (Math.round(1000 * this.second) / 1000).toString() + "秒です。\n"
			ResultValue += "平均密度は" + (Math.round(1000 * (this.combo-1) / this.second) / 1000).toString() + "打/秒です。";
			return ResultValue;
		}
		
		else{ //エラーがある場合
			let ErrorValue = {
				1: "ファイルを読み取ることができませんでした。", 
				2: "TJAコードがありません。",
				3: "難易度が指定されていません。",
				4: "指定の難易度が存在しません。",
				5: "開始小節は\"最初\"か整数を入力してください。",
				6: "終了小節は\"最後\"か整数を入力してください。",
				7: "コンボ数は2以上にしてください。",
				8: "申し訳ございません、バグが発生し正しい値を出力できませんでした。管理者までお問い合わせください。"
			}
			this.ErrorCode.sort(function(first, second){ //ErrorCodeをソート
				if (first > second) return 1;
				else if (first < second) return -1;
				else return 0;
			})
			for (let i=0; i<this.ErrorCode.length; i++) ResultValue += (ErrorValue[this.ErrorCode[i]] + "\n"); //エラー内容を追加
			return ResultValue;
		}	
	},
	
	//Calclatorをリセット
	resetCalclator: function(){
		this.course = "";
		this.StartMeasure = 0;
		this.EndMeasure = 0;
		this.combo = 0;
		this.second = 0;
		this.ErrorCode = [];
		if (TJAFile.files.length == 0) this.ScoreArray = []; //テキストエリアを読み込んだときのみ、ScoreArrayもリセット
	}
}

//ファイル読み込み
function readFile(){
	Calclator.readFile();
}

//計算結果を表示
function showResult(){
	result.innerText = "";
	Calclator.getTextareaContent(); //テキストエリアの中身を取得
	Calclator.readTextBox(); //テキストボックスの情報を取得
	Calclator.calclateMeanDensity(); //平均密度を計算	
	result.innerText = Calclator.getResultValue(); //結果を表示
	Calclator.resetCalclator();
}

//値を取得
let TJAFile = document.getElementById("TJAFile");
let TJATextarea = document.getElementById("TJATextarea");
let CourseElement = document.getElementById("course");
let StartMeasureElement = document.getElementById("StartMeasure");
let EndMeasureElement = document.getElementById("EndMeasure");
let result = document.getElementById("result");
let calcButton = document.getElementById("calcButton");

TJAFile.addEventListener("change", readFile); //ファイルを読み込み（Calclator.ScoreArrayにも内容が格納）
calcButton.addEventListener("click", showResult); //計算結果を表示