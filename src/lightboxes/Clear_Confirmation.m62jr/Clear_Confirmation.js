import wixWindow from 'wix-window'

$w.onReady(function () {
	//TODO: write your page related code here...
	$w('#approveBtn').onClick(() => {
		wixWindow.lightbox.close(true)
	})
	$w('#rejectBtn').onClick(() => {
		wixWindow.lightbox.close(false)
	})
});