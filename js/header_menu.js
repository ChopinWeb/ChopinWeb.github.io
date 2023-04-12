$(".menubtn").click(function () { //ボタンがクリックされたら
  $(this).toggleClass('active'); //ボタン自身にactiveクラスを付与
    $(".nav_container").toggleClass('panelactive'); //ナビゲーションにpanelactiveクラスを付与
});

$(".nav_container li").click(function () { //ナビゲーションのリンクがクリックされたら
	console.log(document.getElementsByClassName("menubtn"));
	if (document.getElementsByClassName("menubtn").item(0).classList.contains("active")){ //ボタンがactiveのときのみ（スマホサイズのときのみ通過可能）
    	$(".menubtn").removeClass('active');　//ボタンのactiveクラスを除去
    	$(".nav_container").removeClass('panelactive'); //ナビゲーションのpanelactiveクラスも除去
    }
});