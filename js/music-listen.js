/***** マクロ定義 *****/
const JSON_NAME = "https://chopinprivate.github.io/ChopinPrivate/json/music.json"; //JSON名
const MODE_PARAM = "mode"; //プレイヤーモードのパラメータ名
const MUSIC_FOLDER = "music"; //楽曲保存用フォルダ

const ITEM_PARAM = "itm"; //アイテムのパラメータ名
const MODE_SINGLE = 's'; //単曲視聴の場合のプレイヤーモードのパラメータ
const MODE_LIST = 'l'; //プレイリストの場合のプレイヤーモードのパラメータ

const PAGE_TITLE_ID = "page_title"; //タイトルヘッダ要素のID
const AUDIO_PLAYER_ID = "audio-player"; //楽曲プレイヤー要素のID
const REWIND_ID = "rewind"; //巻き戻しボタン要素のID
const FORWARD_ID = "forward"; //先送りボタン要素のID
const ERROR_MSG_ID = "error_msg"; //エラーメッセージ要素のID

const S_MUSIC_KEY = "single_music"; //単曲視聴楽曲を集めたJSONのkey
const P_MUSIC_KEY = "playlist_music"; //プレイリスト中の楽曲を集めたJSONのkey
const PLAYLIST_KEY = "playlist"; //プレイリストを集めたJOSNのkey

const MODE_ERROR = 0; //プレイヤーモードの指定エラー
const EMPTY_ERROR = 1; //アイテム未発見の指定エラー


/***** URLパラメータを取得 *****/
function getParam(name, url) {
    if (!url) url = window.location.href; //URLが指定されていない場合は現在のページのURL
    name = name.replace(/[\[\]]/g, "\\$&"); //パラメータ中の文字をエスケープ
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), //パラメータnameの指定内容を抽出する正規表現
        results = regex.exec(url); //マッチ結果はresultに格納（()でマッチ結果を分割）
		
    if (!results || !results[2]) return null; //nameが指定されていなければnullを返す
    return decodeURIComponent(results[2].replace(/\+/g, " ")); //指定されていれば+をスペースに置き換え返す
}


/***** errに対応するエラーメッセージを出力 *****/
function showErrorMsg(err){
	const error_msg_elm = document.getElementById(ERROR_MSG_ID); //エラーメッセージ要素
	const ErrorMsg = [ //エラーメッセージ一覧
		"プレイヤーモードのパラメータが正しくありません。",
		"楽曲またはプレイリストが見つかりませんでした。"
	];
	error_msg_elm.innerText = ErrorMsg[err]; //対応するエラー文を表示
}


/***** data_iの中からIDがi_idである要素のインデックス値を返す *****/
function getItemIndex(i_id, data_i) {
	for (let[idx, itm] of data_i.entries()){ //アイテムリストを順に走査
		if (itm.ID == i_id){ //IDがl_idと等しければ
			return idx; //インデックス値を返す
		}
	}
	return null; //見つからなかった場合はnullを返す
}


/***** 楽曲プレイヤーを作成 *****/
function makeMusicPlayer(){
    let currentTrack = 0; //現在のトラック番号
    const audioPlayer = document.getElementById(AUDIO_PLAYER_ID); //楽曲プレイヤー要素
    const rewindBtn = document.getElementById(REWIND_ID); //巻き戻しボタン要素
    const forwardBtn = document.getElementById(FORWARD_ID); //先送りボタン要素
    const audioBuffers = []; //オーディオオブジェクト格納用

	/*** URLパラメータ取得 ***/
	let mode = getParam(MODE_PARAM); //モードパラメータ
	if (mode!=MODE_SINGLE && mode!=MODE_LIST){ //指定がおかしい場合はエラーを表示し終了
		showErrorMsg(MODE_ERROR);
		return;
	}
	let item; //アイテムパラメータ
	const item_str = getParam(ITEM_PARAM); //アイテムパラメータ（文字列）
	if (item_str == null){ //指定されていない場合はエラーを表示し終了
		showErrorMsg(EMPTY_ERROR);
		return;
	} else { //指定されている場合はパラメータを数値に変換
		item = parseInt(item_str);
	}
	
	/*** 楽曲リストを作成 ***/
	let playlist = []; //楽曲ファイルリスト
	let m_namelist = []; //楽曲名リスト
	let item_name; //アイテム名
	//単曲視聴の場合、アイテムIDに合致する1つの楽曲を楽曲リストに追加
	if (mode == MODE_SINGLE){
		const msc_idx = getItemIndex(item, data[S_MUSIC_KEY]); //アイテムIDから楽曲インデックス値を取得
		if (msc_idx != null){ //指定の楽曲が見つかれば
			item_name = data[S_MUSIC_KEY][msc_idx].name; //アイテム名取得
			playlist.push(MUSIC_FOLDER + "/" + item_name + "." + data[S_MUSIC_KEY][msc_idx].type); //楽曲ファイル名をプレイリストに追加
		}
	}
	
	//プレイリストの場合、アイテムIDに合致するプレイリスト内の全楽曲を楽曲リストに追加
	else {
		const plis_idx = getItemIndex(item, data[PLAYLIST_KEY]); //アイテムIDからプレイリストインデックス値を取得
		if (plis_idx != null){ //指定のプレイリストが見つかれば
			item_name = data[PLAYLIST_KEY][plis_idx].name; //アイテム名取得
			const data_msc = data[PLAYLIST_KEY][plis_idx].musics; //プレイリスト内の楽曲リスト取得
			data_msc.forEach((msc) => { //プレイリスト内の各楽曲を走査
				msc_idx = getItemIndex(msc, data[P_MUSIC_KEY]); //走査中の楽曲IDから楽曲インデックス値を取得
				if (msc_idx != null){ //指定の楽曲が見つかれば
					const msc_name = data[P_MUSIC_KEY][msc_idx].name; //楽曲名取得
					m_namelist.push(msc_name); //楽曲名をリストに追加
					playlist.push(MUSIC_FOLDER + "/" + msc_name + "." + data[P_MUSIC_KEY][msc_idx].type); //楽曲ファイルをプレイリストに追加
				}
			});
		}
	}
	
	//プレイリストが空の場合はエラーを表示し終了
	if (playlist.length == 0){
		showErrorMsg(EMPTY_ERROR);
		return;
	}
	
	/*** タイトルの変更と楽曲リストの表示 ***/
	document.title = "音楽プレイヤー｜" + item_name; //タイトル変更
	document.getElementById(PAGE_TITLE_ID).innerText = item_name; //タイトルヘッダ変更
	if (MODE_LIST){ //プレイリストの場合は楽曲リストも表示
		
	}
	
    /*** playlist中の楽曲をプリロードし、callbackを呼ぶ関数 ***/
    function preloadAudios(playlist, callback) {
      let loaded = 0; //読み込み完了ファイル数

      playlist.forEach((src, index) => { //プレイリスト内の楽曲を順に走査
        const audio = new Audio(); //走査中の楽曲用のオーディオオブジェクト
        audio.src = src; //楽曲ファイル
        audio.preload = "auto"; //アクセス時にすべて読み込む
        audio.addEventListener('canplaythrough', () => { //srcが読み込めたら
          audioBuffers[index] = audio; //オーディオオブジェクトを配列に追加し、
          loaded++; //読み込み数をカウントアップ
          if (loaded === playlist.length) { //すべて読み込めたら
            callback(); //次の処理を進める（1つ目の楽曲ファイルを再生）
          }
        });
      });
    }

	/*** トラック番号indexの楽曲ファイルを再生する関数 ***/
    function playTrack(index) {
      console.log(playlist);
	  const currentAudio = audioBuffers[index]; //現在のオーディオオブジェクト
      audioPlayer.src = currentAudio.src; //楽曲ファイルを更新
      audioPlayer.play().catch((err) => { //再生
		document.getElementById(ERROR_MSG_ID).innerText = "エラー:"+err;
	  });
      currentTrack = index; //現在のトラック番号を更新
    }

	/*** 既存要素のイベント追加 ***/
	//終了時のプレイヤー
    audioPlayer.addEventListener('ended', () => {
      playTrack((currentTrack+1) % playlist.length); //次の楽曲を再生
    });

    //10秒巻き戻し
    rewindBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    });

    //10秒先送り
    forwardBtn.addEventListener('click', () => {
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    });
	
	/*** 楽曲をプリロードし、1つ目の楽曲ファイルを再生 ***/
    preloadAudios(playlist, () => {
      playTrack(0);
    });
}


/***** JSONを読み込んだ後、楽曲プレイヤーを作成 ***/
function readJSON(){
	/*** JSONデータ読み込み ***/
	let requestURL = JSON_NAME; //JSONのURL名
	let request = new XMLHttpRequest(); //読み込みリクエストAPI
	request.open("GET", requestURL); //JSONのURLでリクエストを初期化
	request.send(); //リクエストを送る
	
	/*** JSONを読み込み、オブジェクトに変換後、楽曲プレイヤーを作成 ***/
	request.onload = function(){ //読み込み完了時の動き
		let data_string = request.response; //読み込み内容（文字列）
		data = JSON.parse(data_string); //JSONとして解析
		makeMusicPlayer(data); //読み込んだJSONをもとに楽曲プレイヤーを作成
	}
}


/***** ウィンドウを開いた際にJSONを読み込んだ後、楽曲プレイヤーを作成 ***/
window.addEventListener("load", readJSON);