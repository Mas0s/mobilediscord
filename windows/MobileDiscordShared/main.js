﻿(function () {
    "use strict";
    const localSettings = Windows.Storage.ApplicationData.current.localSettings;
    const MIN_WIDTH = localSettings.values.MIN_WIDTH || 360;
    const MIN_HEIGHT = localSettings.values.MIN_HEIGHT || 500;
    const applicationView = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
    applicationView.setPreferredMinSize({ width: MIN_WIDTH, height: MIN_HEIGHT });
    const backgroundColor = { a: 0xff, r: 0x28, g: 0x2b, b: 0x30 };
    const foregroundColor = Windows.UI.Colors.white;
    const titleBar = applicationView.titleBar;
    titleBar.backgroundColor = backgroundColor;
    titleBar.foregroundColor = foregroundColor;
    titleBar.buttonBackgroundColor = backgroundColor;
    titleBar.buttonForegroundColor = foregroundColor;
    titleBar.buttonHoverBackgroundColor = { a: 0xff, r: 0x3d, g: 0x3f, b: 0x44 };
    titleBar.buttonHoverForegroundColor = foregroundColor;
    titleBar.buttonPressedBackgroundColor = { a: 0xff, r: 0x53, g: 0x55, b: 0x59 };
    titleBar.buttonPressedForegroundColor = foregroundColor;
    // phone status bar
    if ("StatusBar" in Windows.UI.ViewManagement) {
        const statusBar = Windows.UI.ViewManagement.StatusBar.getForCurrentView();
        statusBar.backgroundColor = backgroundColor;
        statusBar.backgroundOpacity = 1;
        statusBar.foregroundColor = foregroundColor;
        statusBar.showAsync();
    }
    Windows.UI.WebUI.WebUIApplication.onactivated = eventArgs => {
        let getImageLocation;
        if ("Phone" in Windows) {
            // SplashScreen gives us wrong location on Mobile
            getImageLocation = () => {
                applicationView.setDesiredBoundsMode(Windows.UI.ViewManagement.ApplicationViewBoundsMode.useCoreWindow);
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                applicationView.setDesiredBoundsMode(Windows.UI.ViewManagement.ApplicationViewBoundsMode.useVisible);
                let width = 620;
                let height = 300;
                // scale to fit
                if (width * windowHeight >= windowWidth * height) {
                    height = windowWidth * height / width;
                    width = windowWidth;
                } else {
                    width = windowHeight * width / height;
                    height = windowHeight;
                }
                const visibleBounds = applicationView.visibleBounds;
                const x = windowWidth / 2 - width / 2 - visibleBounds.x;
                const y = windowHeight / 2 - height / 2 - visibleBounds.y;
                return { x, y, width, height };
            };
        } else {
            const splash = eventArgs.splashScreen;
            getImageLocation = () => splash.imageLocation;
        }
        const extendedSplashImage = document.getElementById("extended-splash-image");
        function positionImage() {
            const imageRect = getImageLocation();
            extendedSplashImage.style.top = imageRect.y + "px";
            extendedSplashImage.style.left = imageRect.x + "px";
            extendedSplashImage.style.height = imageRect.height + "px";
            extendedSplashImage.style.width = imageRect.width + "px";
        }
        positionImage();
        window.onresize = eventArgs => {
            positionImage();
        };
        const extendedSplashScreen = document.getElementById("extended-splash-screen");
        extendedSplashScreen.hidden = false;
        setImmediate(() => {
            const releaseChannel = buildInfo.releaseChannel;
            const WEBAPP_ENDPOINT = buildInfo.WEBAPP_ENDPOINT || (releaseChannel === "stable" ? "https://mobilediscord.com" : "https://" + releaseChannel + ".mobilediscord.com");
            let lastUrl;
            if (eventArgs.previousExecutionState === Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated)
                lastUrl = localSettings.values.lastUrl;
            const appPath = "/channels/@me";
            const WEBAPP_PATH = lastUrl || localSettings.values.WEBAPP_PATH || appPath;
            const urlToLoad = "" + WEBAPP_ENDPOINT + WEBAPP_PATH;
            location.replace(urlToLoad);
        });
    };
})();
