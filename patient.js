"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const sosButton =
            document.getElementById(
                "sosButton"
            );


        if (!sosButton) {
            return;
        }


        sosButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Activate Emergency SOS?"
                    );


                if (!confirmed) {
                    return;
                }


                sosButton.disabled = true;

                sosButton.innerHTML = `
                    <span>...</span>
                    <small>ALERTING</small>
                `;


                function sendEmergency(
                    latitude = null,
                    longitude = null
                ) {

                    SmartCare.request(
                        "/emergency",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({
                                    latitude,
                                    longitude,

                                    message:
                                        "Patient activated Emergency SOS."
                                })
                        }
                    )
                    .then(() => {

                        sosButton.innerHTML = `
                            <span>✓</span>
                            <small>ALERT SENT</small>
                        `;


                        SmartCare.showToast(
                            "Emergency alert sent successfully."
                        );


                        setTimeout(() => {

                            sosButton.disabled =
                                false;

                            sosButton.innerHTML = `
                                <span>SOS</span>
                                <small>EMERGENCY</small>
                            `;

                        }, 4000);

                    })
                    .catch(error => {

                        console.error(error);

                        SmartCare.showToast(
                            error.message,
                            "error"
                        );


                        sosButton.disabled =
                            false;

                    });

                }


                if (
                    navigator.geolocation
                ) {

                    navigator.geolocation
                        .getCurrentPosition(

                            position => {

                                sendEmergency(
                                    position.coords.latitude,
                                    position.coords.longitude
                                );

                            },

                            () => {

                                /*
                                    Still send the alert if
                                    location permission is denied.
                                */

                                sendEmergency();

                            },

                            {
                                enableHighAccuracy: true,
                                timeout: 7000,
                                maximumAge: 0
                            }

                        );

                } else {

                    sendEmergency();

                }

            }
        );

    }
);