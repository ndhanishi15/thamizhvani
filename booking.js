"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modal =
            document.getElementById(
                "bookingModal"
            );

        const closeModal =
            document.getElementById(
                "closeModal"
            );

        const bookingForm =
            document.getElementById(
                "bookingForm"
            );

        const selectedDoctor =
            document.getElementById(
                "selectedDoctor"
            );


        let selectedDoctorId =
            null;


        /*
            Load doctors from API
        */

        async function loadDoctors() {

            try {

                const data =
                    await SmartCare.request(
                        "/doctors"
                    );


                console.log(
                    "Doctors:",
                    data.doctors
                );


            } catch (error) {

                console.error(error);

            }

        }


        loadDoctors();


        /*
            BOOK BUTTON
        */

        document
            .querySelectorAll(".book-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        /*
                            Add data-doctor-id to
                            your doctor buttons.

                            Example:

                            data-doctor-id="2"
                        */

                        selectedDoctorId =
                            button.dataset.doctorId;


                        selectedDoctor.textContent =
                            button.dataset.doctor;


                        modal.classList.remove(
                            "hidden"
                        );

                    }
                );

            });


        closeModal.addEventListener(
            "click",
            () => {

                modal.classList.add(
                    "hidden"
                );

            }
        );


        /*
            CONFIRM BOOKING
        */

        bookingForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (!SmartCare.isLoggedIn()) {

                    SmartCare.showToast(
                        "Please login as a patient first.",
                        "error"
                    );

                    return;

                }


                if (!selectedDoctorId) {

                    SmartCare.showToast(
                        "Doctor information is missing.",
                        "error"
                    );

                    return;

                }


                const appointmentDate =
                    document.getElementById(
                        "appointmentDate"
                    ).value;


                const appointmentTime =
                    document.getElementById(
                        "appointmentTime"
                    ).value;


                const consultationType =
                    document.getElementById(
                        "consultationType"
                    ).value;


                const reason =
                    document.getElementById(
                        "visitReason"
                    ).value;


                try {

                    await SmartCare.request(
                        "/appointments",
                        {
                            method: "POST",

                            body:
                                JSON.stringify({

                                    doctorId:
                                        Number(
                                            selectedDoctorId
                                        ),

                                    appointmentDate,

                                    appointmentTime,

                                    consultationType,

                                    reason

                                })
                        }
                    );


                    modal.classList.add(
                        "hidden"
                    );


                    bookingForm.reset();


                    SmartCare.showToast(
                        "Appointment booked successfully!"
                    );


                } catch (error) {

                    SmartCare.showToast(
                        error.message,
                        "error"
                    );

                }

            }
        );

    }
);