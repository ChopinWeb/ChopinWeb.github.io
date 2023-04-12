$(".menubtn").click(function () { //ボタンがクリックされたら
  $(this).toggleClass('active'); //ボタン自身にactiveクラスを付与
    $(".header_nav").toggleClass('panelactive'); //ナビゲーションにpanelactiveクラスを付与
});

$(".header_nav li").click(function () { //ナビゲーションのリンクがクリックされたら
	console.log(document.getElementsByClassName("menubtn"));
	if (document.getElementsByClassName("menubtn").item(0).classList.contains("active")){ //ボタンがactiveのときのみ（スマホサイズのときのみ通過可能）
    	$(".menubtn").removeClass('active');　//ボタンのactiveクラスを除去
    	$(".header_nav").removeClass('panelactive'); //ナビゲーションのpanelactiveクラスも除去
    }
});