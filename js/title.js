var i = 0;
var titleText = [
	"ValoPedia", "ValoPedi", "ValoPed", "ValoPe", "ValoP", "Valo ",
	"Va", "Val", "Valo", "ValoP", "ValoPe", "ValoPed", "ValoPe", "ValoPed", "ValoPedi", "ValoPedia"
];

if (document.addEventListener) {
	document.addEventListener("DOMContentLoaded", function() {
		loaded();
	});
} else if (document.attachEvent) {
	document.attachEvent("onreadystatechange", function() {
		loaded();
	});
}

function loaded() {
	setInterval(loop, 250);
}

function loop() {
	document.getElementsByTagName("title")[0].innerHTML = titleText[i++ % titleText.length];
}



