"use strict";

const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireRole
} = require("../middleware/auth");


function createPatientRouter(db) {

    /*
        PATIENT DASHBOARD
    */

    router.get(
        "/dashboard",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const patient =
                    db.prepare(`
                        SELECT
                            u.id,
                            u.name,
                            u.email,
                            u.phone,
                            p.date_of_birth,
                            p.gender,
                            p.blood_group,
                            p.emergency_contact_name,
                            p.emergency_contact_phone,
                            p.health_score
                        FROM users u
                        JOIN patient_profiles p
                            ON p.user_id = u.id
                        WHERE u.id = ?
                    `).get(
                        req.user.id
                    );


                if (!patient) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Patient profile not found."
                    });

                }


                const vitals =
                    db.prepare(`
                        SELECT *
                        FROM vitals
                        WHERE patient_id = ?
                        ORDER BY recorded_at DESC
                        LIMIT 1
                    `).get(
                        req.user.id
                    );


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
                        AND a.status = 'confirmed'
                        ORDER BY
                            a.appointment_date,
                            a.appointment_time
                        LIMIT 5
                    `).all(
                        req.user.id
                    );


                const medicines =
                    db.prepare(`
                        SELECT *
                        FROM medicines
                        WHERE patient_id = ?
                        AND active = 1
                        ORDER BY medicine_time
                    `).all(
                        req.user.id
                    );


                const emergencies =
                    db.prepare(`
                        SELECT *
                        FROM emergency_alerts
                        WHERE patient_id = ?
                        ORDER BY created_at DESC
                        LIMIT 5
                    `).all(
                        req.user.id
                    );


                res.json({
                    success: true,

                    patient,

                    vitals: vitals || null,

                    appointments,

                    medicines,

                    emergencies
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to load patient dashboard."
                });

            }

        }
    );


    /*
        ADD VITALS
    */

    router.post(
        "/vitals",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const {
                    heartRate,
                    oxygenLevel,
                    temperature,
                    systolic,
                    diastolic
                } = req.body;


                const result =
                    db.prepare(`
                        INSERT INTO vitals
                        (
                            patient_id,
                            heart_rate,
                            oxygen_level,
                            temperature,
                            systolic,
                            diastolic
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `).run(
                        req.user.id,
                        heartRate || null,
                        oxygenLevel || null,
                        temperature || null,
                        systolic || null,
                        diastolic || null
                    );


                /*
                    Simple demo health score.

                    Production systems should NOT use
                    this simplistic calculation.
                */

                let score = 100;


                if (
                    heartRate &&
                    (heartRate < 60 ||
                    heartRate > 100)
                ) {
                    score -= 15;
                }


                if (
                    oxygenLevel &&
                    oxygenLevel < 95
                ) {
                    score -= 20;
                }


                if (
                    systolic &&
                    systolic >= 140
                ) {
                    score -= 20;
                }


                score =
                    Math.max(
                        0,
                        Math.min(100, score)
                    );


                db.prepare(`
                    UPDATE patient_profiles
                    SET health_score = ?
                    WHERE user_id = ?
                `).run(
                    score,
                    req.user.id
                );


                res.status(201).json({
                    success: true,
                    message:
                        "Vitals recorded successfully.",
                    vitalId:
                        result.lastInsertRowid,
                    healthScore:
                        score
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to record vitals."
                });

            }

        }
    );


    return router;
}


module.exports = createPatientRouter;