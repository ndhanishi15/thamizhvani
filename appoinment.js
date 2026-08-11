"use strict";

const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireRole
} = require("../middleware/auth");


function createAppointmentRouter(db) {

    /*
        CREATE APPOINTMENT
    */

    router.post(
        "/",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const {
                    doctorId,
                    appointmentDate,
                    appointmentTime,
                    consultationType,
                    reason
                } = req.body;


                if (
                    !doctorId ||
                    !appointmentDate ||
                    !appointmentTime ||
                    !consultationType
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Required appointment information is missing."
                    });

                }


                const doctor =
                    db.prepare(`
                        SELECT id
                        FROM users
                        WHERE id = ?
                        AND role = 'doctor'
                    `).get(doctorId);


                if (!doctor) {

                    return res.status(404).json({
                        success: false,
                        message: "Doctor not found."
                    });

                }


                const existing =
                    db.prepare(`
                        SELECT id
                        FROM appointments
                        WHERE doctor_id = ?
                        AND appointment_date = ?
                        AND appointment_time = ?
                        AND status = 'confirmed'
                    `).get(
                        doctorId,
                        appointmentDate,
                        appointmentTime
                    );


                if (existing) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "This appointment slot is already booked."
                    });

                }


                const result =
                    db.prepare(`
                        INSERT INTO appointments
                        (
                            patient_id,
                            doctor_id,
                            appointment_date,
                            appointment_time,
                            consultation_type,
                            reason,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
                    `).run(
                        req.user.id,
                        doctorId,
                        appointmentDate,
                        appointmentTime,
                        consultationType,
                        reason || null
                    );


                res.status(201).json({
                    success: true,
                    message:
                        "Appointment booked successfully.",
                    appointmentId:
                        result.lastInsertRowid
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to book appointment."
                });

            }

        }
    );


    /*
        PATIENT APPOINTMENTS
    */

    router.get(
        "/patient",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const appointments =
                    db.prepare(`
                        SELECT
                            a.*,
                            u.name AS doctor_name,
                            d.specialty
                        FROM appointments a
                        JOIN users u
                            ON u.id = a.doctor_id
                        JOIN doctor_profiles d
                            ON d.user_id = u.id
                        WHERE a.patient_id = ?
                        ORDER BY
                            a.appointment_date ASC,
                            a.appointment_time ASC
                    `).all(
                        req.user.id
                    );


                res.json({
                    success: true,
                    appointments
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to load appointments."
                });

            }

        }
    );


    /*
        DOCTOR APPOINTMENTS
    */

    router.get(
        "/doctor",
        authenticateToken,
        requireRole("doctor"),
        (req, res) => {

            try {

                const appointments =
                    db.prepare(`
                        SELECT
                            a.*,
                            u.name AS patient_name,
                            u.phone AS patient_phone
                        FROM appointments a
                        JOIN users u
                            ON u.id = a.patient_id
                        WHERE a.doctor_id = ?
                        ORDER BY
                            a.appointment_date ASC,
                            a.appointment_time ASC
                    `).all(
                        req.user.id
                    );


                res.json({
                    success: true,
                    appointments
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to load doctor appointments."
                });

            }

        }
    );


    /*
        CANCEL APPOINTMENT
    */

    router.patch(
        "/:id/cancel",
        authenticateToken,
        (req, res) => {

            try {

                const appointment =
                    db.prepare(`
                        SELECT *
                        FROM appointments
                        WHERE id = ?
                    `).get(
                        req.params.id
                    );


                if (!appointment) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Appointment not found."
                    });

                }


                const allowed =
                    appointment.patient_id === req.user.id ||
                    appointment.doctor_id === req.user.id;


                if (!allowed) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "You cannot cancel this appointment."
                    });

                }


                db.prepare(`
                    UPDATE appointments
                    SET status = 'cancelled'
                    WHERE id = ?
                `).run(
                    req.params.id
                );


                res.json({
                    success: true,
                    message:
                        "Appointment cancelled."
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to cancel appointment."
                });

            }

        }
    );


    return router;
}


module.exports = createAppointmentRouter;