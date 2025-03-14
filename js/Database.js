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

//ファイルをダウンロード
function downloadFile(file_name, download_URL){
	download_link = document.createElement("a"); //<a> 要素を作成
	download_link.href = download_URL;
	download_link.download = file_name;
	document.body.appendChild(download_link);
    download_link.click(); //自動的にクリックしてダウンロードを開始
    document.body.removeChild(download_link); //<a>要素を削除
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
	if (folder_str == null && item_str != null){ //アイテムパラメータにだけ値が入力されている場合
		showErrorMsg(1);
		return;
	}
	
	//URLパラメータを数値に変換
	let folder, item;
	if (folder_str == null) folder = 0;
	else folder = parseInt(folder_str);
	if (item_str != null) item = parseInt(item_str);
	//console.log(folder, item);
	
	//ファイルパスを形成
	file_path = document.getElementById("file_path");
	let parent_folder_list = [];
	if (folder!=0){
		let now_folder_parent;
		let now_folder = folder;
		while (now_folder!=0){
			now_folder_parent = data["Folder"][now_folder].parent_folder;
			parent_folder_list.push(now_folder_parent);
			now_folder = now_folder_parent;
		}
		for (let i=parent_folder_list.length-1; i>-1; i--){
			let path_element = document.createElement("a"); //各上位フォルダ
			let path_joint = document.createElement("span"); //フォルダの接合部分
			path_element.innerText = data["Folder"][parent_folder_list[i]].name;
			path_element.href = "./Database.html?fld=" + parent_folder_list[i];
			path_joint.innerText = " > ";
			file_path.append(path_element);
			file_path.append(path_joint);
		}
	}
	let path_element = document.createElement("a"); //自身のフォルダをファイルパスに追加
	path_element.innerText = data["Folder"][folder].name;
	if (item_str != null) path_element.href = "./Database.html?fld=" + folder;
	file_path.append(path_element);
	if (item_str != null){ //アイテム名追加
		let path_element = document.createElement("a"); //アイテム名
		let path_joint = document.createElement("span"); //フォルダの接合部分
		path_element.innerText = data["Item"][item].name;
		path_joint.innerText = " > ";
		file_path.append(path_joint);
		file_path.append(path_element);
	}

	//そのフォルダ内にあるコンテンツ・フォルダを表示
	if (item_str == null){
		child_content = document.getElementById("child_content");
		if (data["Folder"][folder].child_folder.length!=0){ //末端フォルダでない場合
			for (let i=0; i<data["Folder"][folder].child_folder.length; i++){
				let child_element = document.createElement("li");
				let child_link = document.createElement("a");
				child_link.innerText = data["Folder"][data["Folder"][folder].child_folder[i]].name;
				child_link.href = "./Database.html?fld=" + data["Folder"][folder].child_folder[i];
				child_element.append(child_link);
				child_content.append(child_element);
			}
		}
		else if (data["Folder"][folder].child_item.length!=0){ //末端フォルダの場合
			for (let i=0; i<data["Folder"][folder].child_item.length; i++){
				let child_element = document.createElement("li");
				let child_link = document.createElement("a");
				child_link.innerText = data["Item"][data["Folder"][folder].child_item[i]].name;
				child_link.href = "./Database.html?fld=" + folder + "&itm=" + data["Folder"][folder].child_item[i];
				child_element.append(child_link);
				child_content.append(child_element);
			}
		}
	}
	
	//コンテンツ情報を表示
	else{
		let contents_info = document.getElementById("contents_info");

		//備考
		let remarks = document.createElement("ul");
		parent_folder_list.unshift(folder) //parent_folder_listにfolderを追加
		for (let i=parent_folder_list.length-1; i>-1; i--){ //祖先フォルダから順にremarksの内容を追加
			for (let j=0; j<data["Folder"][parent_folder_list[i]]["remarks"].length; j++){
				let remarks_single = document.createElement("li");
				remarks_single.innerText = data["Folder"][parent_folder_list[i]]["remarks"][j];
				remarks.appendChild(remarks_single);
			}
		}
		contents_info.appendChild(remarks);
		
		//ダウンロードボタン
		//console.log(data["Item"][item].drive_id);
		let download_btn = document.createElement("button");
        download_btn.id = "download_btn";
        download_btn.innerText = "ダウンロード";
		contents_info.appendChild(download_btn);
		download_btn.addEventListener("click", () => {
			file_name = data["Item"][item].name + ".zip";
			download_URL = "https://drive.google.com/uc?export=download&id=" + data["Item"][item].drive_id;
			downloadFile(file_name, download_URL);
			if (data["Folder"][folder]["kind"]=="danni"){ //段位の場合、スキンもダウンロード
				file_name = "skin.zip";
			}
		});
	}
}

function showContents(){
	//JSONデータ読み込み
	//let requestURL = "file:///C:/ChopinWeb/main/json/Database.json"; //jsonへのパス
	let requestURL = "https://chopinweb.github.io/json/Database.json"; //jsonへのパス
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.send();
 
	//JSONの文字列をオブジェクトに変換
	request.onload = function(){
  		let data_string = request.response;
  		data = JSON.parse(data_string);
  		makeElements(data); //document要素を生成
	}
 }

window.addEventListener("load", showContents);