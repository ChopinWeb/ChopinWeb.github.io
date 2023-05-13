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

 //document要素を形成
 //fld, itmがnullの場合，最大値を超えた場合は未想定
function makeElements(data) {
	//URLパラメータを取得
	folder_str = getParam("fld");
	item_str = getParam("itm");
	
	//URLパラメータが有効であるかチェック
	if (folder_str != null){ //フォルダパラメータに0以上の整数でない値が入力されている場合
		if (!/^[0-9]+$/.test(folder_str)){
			showErrorMsg(1);
			return;
		}
	}
	if (item_str != null){ //アイテムパラメータに1以上の整数でない値が入力されている場合
		if (!/^0*[1-9][0-9]*$/.test(item_str)){
			showErrorMsg(1);
			return;
		}
	}
	if (folder_str != null && item_str != null){ //どちらものパラメータに値が入力されている場合
		showErrorMsg(1);
		return;
	}
	
	//URLパラメータを数値に変換
	let folder, item;
	if (folder_str != null) folder = parseInt(folder_str);
	if (item_str != null) item = parseInt(item_str);
	if (folder == null && item == null) folder = 0;
	//if (item_str != null) folder = 
	console.log(folder, item);
	console.log(typeof folder, typeof item);
	
	//ファイルパスを形成
	file_path = document.getElementById("file_path");
	for (let i=0; i<data["Folder"][folder].parent_folder.length; i++){
		let path_element = document.createElement("a"); //各上位フォルダ
		let path_joint = document.createElement("span"); //フォルダの接合部分
		path_element.innerText = data["Folder"][data["Folder"][folder].parent_folder[i]].name;
		path_element.href = "./Database.html?fld=" + data["Folder"][folder].parent_folder[i];
		path_joint.innerText = " > ";
		file_path.append(path_element);
		file_path.append(path_joint);
	}
	let path_element = document.createElement("a"); //自身のフォルダをファイルパスに追加
	path_element.innerText = data["Folder"][folder].name;
	file_path.append(path_element);

	//そのフォルダ内にあるコンテンツ・フォルダを表示
	child_content = document.getElementById("child_content");
	for (let i=0; i<data["Folder"][folder].child_folder.length; i++){
		let child_element = document.createElement("li");
		let child_link = document.createElement("a");
		child_link.innerText = data["Folder"][data["Folder"][folder].child_folder[i]].name;
		child_link.href = "./Database.html?fld=" + data["Folder"][folder].child_folder[i];
		child_element.append(child_link);
		child_content.append(child_element);
	}
}

function showContents(){
	//JSONデータ読み込み
	//let requestURL = "./json/Database_folder.json"; //jsonへのパス
	let requestURL = "https://chopinweb.github.io/json/Database.json"; //jsonへのパス
	//let requestURL = "https://chopinweb.github.io/json/test.json"; //jsonへのパス
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.send();
 
	//JSONの文字列をオブジェクトに変換
	request.onload = function(){
  		let data_string = request.response;
  		data = JSON.parse(data_string);
  		console.log(data);
  		makeElements(data); //document要素を生成
	}
 }

window.addEventListener("load", showContents);