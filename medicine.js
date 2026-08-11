"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const medicineList =
            document.getElementById(
                "medicineList"
            );


        const medicineForm =
            document.getElementById(
                "medicineForm"
            );


        async function loadMedicines() {

            try {

                const data =
                    await SmartCare.request(
                        "/medicines"
                    );


                renderMedicines(
                    data.medicines
                );


            } catch (error) {

                SmartCare.showToast(
                    error.message,
                    "error"
                );

            }

        }


        function renderMedicines(
            medicines
        ) {

            if (!medicineList) {
                return;
            }


            medicineList.innerHTML =
                "";


            if (!medicines.length) {

                medicineList.innerHTML = `
                    <div class="no-results">
                        <div>💊</div>
                        <h3>No medicines</h3>
                        <p>
                            Add your first medicine.
                        </p>
                    </div>
                `;

                return;

            }


            medicines.forEach(
                medicine => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "medicine-row";


                    row.innerHTML = `

                        <div class="medicine-main">

                            <div class="medicine-big-icon">
                                💊
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        medicine.name
                                    )}
                                </h3>

                                <span>
                                    ${escapeHTML(
                                        medicine.dosage
                                    )}
                                </span>

                                <small>
                                    ${escapeHTML(
                                        medicine.frequency
                                    )}
                                </small>

                            </div>

                        </div>


                        <div class="medicine-schedule">

                            <strong>
                                ${escapeHTML(
                                    medicine.frequency
                                )}
                            </strong>

                            <span>
                                Scheduled
                            </span>

                        </div>


                        <div class="medicine-time">

                            <span>
                                ${escapeHTML(
                                    medicine.medicine_time
                                )}
                            </span>

                            <button
                                class="pending-btn"
                                data-id="${medicine.id}"
                            >
                                Mark Taken
                            </button>

                        </div>

                    `;


                    const button =
                        row.querySelector(
                            ".pending-btn"
                        );


                    button.addEventListener(
                        "click",
                        async () => {

                            try {

                                await SmartCare.request(
                                    `/medicines/${medicine.id}/taken`,
                                    {
                                        method:
                                            "POST"
                                    }
                                );


                                button.textContent =
                                    "✓ Taken";

                                button.className =
                                    "taken-btn";


                                SmartCare.showToast(
                                    "Medicine marked as taken."
                                );

                            } catch (error) {

                                SmartCare.showToast(
                                    error.message,
                                    "error"
                                );

                            }

                        }
                    );


                    medicineList.appendChild(
                        row
                    );

                }
            );

        }


        if (medicineForm) {

            medicineForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const name =
                        document.getElementById(
                            "medicineName"
                        ).value;


                    const dosage =
                        document.getElementById(
                            "medicineDosage"
                        ).value;


                    const medicineTime =
                        document.getElementById(
                            "medicineTime"
                        ).value;


                    try {

                        await SmartCare.request(
                            "/medicines",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({

                                        name,

                                        dosage,

                                        frequency:
                                            "Daily",

                                        medicineTime

                                    })
                            }
                        );


                        medicineForm.reset();


                        document
                            .getElementById(
                                "medicineModal"
                            )
                            .classList.add(
                                "hidden"
                            );


                        SmartCare.showToast(
                            "Medicine added successfully."
                        );


                        loadMedicines();

                    } catch (error) {

                        SmartCare.showToast(
                            error.message,
                            "error"
                        );

                    }

                }
            );

        }


        function escapeHTML(value) {

            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");

        }


        loadMedicines();

    }
);