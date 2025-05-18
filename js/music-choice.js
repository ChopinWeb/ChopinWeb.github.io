/***** マクロ定義 *****/
const JSON_NAME = "https://chopinprivate.github.io/ChopinPrivate/json/music.json"; //JSON名
const LISTEN_HTML = "music-listen.html"; //視聴用HTML

const MODE_PARAM = "mode"; //プレイヤーモードのパラメータ名
const ITEM_PARAM = "itm"; //アイテムのパラメータ名
const MODE_SINGLE = 's'; //単曲視聴の場合のプレイヤーモードのパラメータ
const MODE_LIST = 'l'; //プレイリストの場合のプレイヤーモードのパラメータ

const PAGE_TITLE_ID = "page_title"; //タイトルヘッダ要素のID
const LISTEN_LIST_ID = "listen_list" //視聴対象リスト要素のID
const ERROR_MSG_ID = "error_msg"; //エラーメッセージ要素のID

const S_MUSIC_KEY = "single_music"; //単曲視聴楽曲を集めたJSONのkey
const P_MUSIC_KEY = "playlist_music"; //プレイリスト中の楽曲を集めたJSONのkey
const PLAYLIST_KEY = "playlist"; //プレイリストを集めたJOSNのkey

const MODE_ERROR = 0; //プレイヤーモードの指定エラー


/***** errに対応するエラーメッセージを出力 *****/
function showErrorMsg(err){
	const error_msg_elm = document.getElementById(ERROR_MSG_ID); //エラーメッセージ要素
	const ErrorMsg = [ //エラーメッセージ一覧
		"プレイヤーモードのパラメータが正しくありません。"
	];
	error_msg_elm.innerText = ErrorMsg[err]; //対応するエラー文を表示
}

/***** URLパラメータを取得 *****/
function getParam(name, url) {
    if (!url){ //URLが指定されていない場合は現在のページのURL
		url = window.location.href;
	}
    name = name.replace(/[\[\]]/g, "\\$&"); //パラメータ中の文字をエスケープ
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), //パラメータnameの指定内容を抽出する正規表現
        results = regex.exec(url); //マッチ結果はresultに格納（()でマッチ結果を分割）
		
    if (!results || !results[2]){ //nameが指定されていなければnullを返す
		return null;
	}
    return decodeURIComponent(results[2].replace(/\+/g, " ")); //指定されていれば+をスペースに置き換え返す
}

/***** 視聴リストを作成 *****/
function makeListenList(data){
	/*** URLパラメータ取得 ***/
	let mode = getParam(MODE_PARAM); //モードパラメータ
	if (mode!=MODE_SINGLE && mode!=MODE_LIST){ //指定がおかしい場合はエラーを表示し終了
		showErrorMsg(MODE_ERROR);
		return;
	}
	
	/*** タイトルを変更 ***/
	document.title = (mode==MODE_SINGLE) ? "楽曲選択" : "プレイリスト選択"; //タイトル変更
	document.getElementById(PAGE_TITLE_ID).innerText = document.title; //タイトルヘッダ変更
	
	/*** 楽曲またはプレイリスト（視聴対象）一覧を表示 ***/
	const listen_list_element = document.getElementById(LISTEN_LIST_ID); //視聴対象リスト要素
	const data_listen = //対応するJSONのkeyを読み込み
		data[(mode=='s') ? S_MUSIC_KEY : PLAYLIST_KEY];
	data_listen.forEach((l) => { //視聴対象を順に走査
		let listen_element = document.createElement("li"); //視聴対象要素
		let listen_link = document.createElement("a"); //視聴対象のリンク要素
		listen_link.innerText = l.name; //楽曲名を追加
		listen_link.href =  //URLを追加
			LISTEN_HTML + "?" + MODE_PARAM +"=" + mode + "&" + ITEM_PARAM + "=" + l.ID;
		listen_element.append(listen_link); //リンク要素を視聴対象要素に追加
		listen_list_element.append(listen_element); //視聴対象要素をページに追加
	});
}

/***** JSONを読み込んだ後、視聴リストを作成 ***/
function readJSON(){
	/*** JSONデータ読み込み ***/
	let requestURL = JSON_NAME; //JSONのURL名
	let request = new XMLHttpRequest(); //読み込みリクエストAPI
	request.open("GET", requestURL); //JSONのURLでリクエストを初期化
	request.send(); //リクエストを送る
	
	/*** JSONを読み込み、音楽リストを作成 ***/
	request.onload = function(){ //読み込み完了時の動き
		let data_string = request.response; //読み込み内容（文字列）
		data = JSON.parse(data_string); //JSONとして解析
		makeListenList(data); //読み込んだJSONをもとに視聴リストを作成
	}
}

/***** ウィンドウを開いた際にJSONを読み込んだ後、視聴リストを作成 ***/
window.addEventListener("load", readJSON);