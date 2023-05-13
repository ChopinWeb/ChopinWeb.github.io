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

 //document要素を形成
 //fld, itmがnullの場合，最大値を超えた場合は未想定
function makeElements(data) {
	//URLパラメータを取得
	folder = Number(getParam("fld")).valueOf();
	item = Number(getParam("itm")).valueOf();
	if (folder == null && item == null) folder = 0;
	console.log(folder, item);
	console.log(typeof folder, typeof item);

	//ファイルパスを形成
	filepath = document.getElementById("filepath");
	for (let i=0; i<data[folder].parent_folder.length; i++){
		let path_element = document.createElement("a"); //各上位フォルダ
		let path_joint = document.createElement("span"); //フォルダの接合部分
		path_element.innerText = data[data[folder].parent_folder[i]].name;
		path_element.href = "./Database.html?fld=" + data[folder].parent_folder[i];
		path_joint.innerText = " > ";
		filepath.append(path_element);
		filepath.append(path_joint);
	}
	let path_element = document.createElement("a"); //自身のフォルダをファイルパスに追加
	path_element.innerText = data[folder].name;
	filepath.append(path_element);

	//そのフォルダ内にあるコンテンツ・フォルダを表示
	child_content = document.getElementById("child_content");
	for (let i=0; i<data[folder].child_folder.length; i++){
		let child_element = document.createElement("li");
		let child_link = document.createElement("a");
		child_link.innerText = data[data[folder].child_folder[i]].name;
		child_link.href = "./Database.html?fld=" + data[folder].child_folder[i];
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
	request.onload = function (){
  		let data_string = request.response;
  		data = JSON.parse(data_string);
  		console.log(data);
  		makeElements(data); //document要素を生成
	}
 }

window.addEventListener("load", showContents);
