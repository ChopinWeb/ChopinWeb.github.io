//URLパラメータを取得
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//エラーメッセージを出力
function showErrorMsg(code){
	error_msg = document.getElementById("error_msg");
	if (code == 1) error_msg.innerText = "URLパラメータが無効です。";
	if (code == 2) error_msg.innerText = "指定のフォルダ、ファイルは存在しません。";
}

//コンテンツをダウンロード
function downloadContents(data) {
	//URLパラメータを取得
	item_str = getParam("itm");
	
	//URLパラメータが有効であるかチェック
	if (item_str != null){ //アイテムパラメータに1以上の整数でない値が入力されている場合
		if (!/^0*[1-9][0-9]*$/.test(item_str)){
			showErrorMsg(1);
			return;
		}
	}
	
	//URLパラメータを数値に変換
	let item = parseInt(item_str);
	
	//ダウンロード開始
	window.location.href = "item/" + encodeURIComponent(data["Item"][item].name + ".zip");
	//window.location.href = "https://chopinserver01.github.io/item/" + encodeURIComponent(data["Item"][item].name + ".zip");
	console.log("https://chopinserver01.github.io/item/" + encodeURIComponent(data["Item"][item].name + ".zip"));
	// ページが閉じられる前にウィンドウを閉じる
    //window.addEventListener("unload", () => {
		//window.close();
	//});		
}

function main(){
	//JSONデータ読み込み
	//let requestURL = "./json/Database.json"; //jsonへのパス
	let requestURL = "https://chopinweb.github.io/json/Database.json"; //jsonへのパス
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.send();
 
	//JSONの文字列をオブジェクトに変換
	request.onload = function(){
  		let data_string = request.response;
  		data = JSON.parse(data_string);
  		console.log(data);
  		downloadContents(data); //コンテンツをダウンロード
	}
 }

window.addEventListener("load", main);