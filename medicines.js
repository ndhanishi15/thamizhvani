"use strict";

const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireRole
} = require("../middleware/auth");


function createMedicineRouter(db) {

    /*
        GET MEDICINES
    */

    router.get(
        "/",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const medicines =
                    db.prepare(`
                        SELECT
                            m.id,
                            m.name,
                            m.dosage,
                            m.frequency,
                            m.medicine_time,
                            m.active,
                            u.name AS doctor_name
                        FROM medicines m
                        LEFT JOIN users u
                            ON u.id = m.prescribed_by
                        WHERE m.patient_id = ?
                        AND m.active = 1
                        ORDER BY m.medicine_time
                    `).all(
                        req.user.id
                    );


                res.json({
                    success: true,
                    medicines
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to load medicines."
                });

            }

        }
    );


    /*
        ADD MEDICINE
    */

    router.post(
        "/",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const {
                    name,
                    dosage,
                    frequency,
                    medicineTime
                } = req.body;


                if (
                    !name ||
                    !dosage ||
                    !medicineTime
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Medicine name, dosage and time are required."
                    });

                }


                const result =
                    db.prepare(`
                        INSERT INTO medicines
                        (
                            patient_id,
                            name,
                            dosage,
                            frequency,
                            medicine_time
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `).run(
                        req.user.id,
                        name.trim(),
                        dosage.trim(),
                        frequency || "Daily",
                        medicineTime
                    );


                res.status(201).json({
                    success: true,
                    message:
                        "Medicine added successfully.",
                    medicineId:
                        result.lastInsertRowid
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to add medicine."
                });

            }

        }
    );


    /*
        MARK MEDICINE AS TAKEN
    */

    router.post(
        "/:id/taken",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const medicine =
                    db.prepare(`
                        SELECT id
                        FROM medicines
                        WHERE id = ?
                        AND patient_id = ?
                        AND active = 1
                    `).get(
                        req.params.id,
                        req.user.id
                    );


                if (!medicine) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Medicine not found."
                    });

                }


                db.prepare(`
                    INSERT INTO medicine_logs
                    (
                        medicine_id,
                        patient_id
                    )
                    VALUES (?, ?)
                `).run(
                    medicine.id,
                    req.user.id
                );


                res.json({
                    success: true,
                    message:
                        "Medicine marked as taken."
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to update medicine."
                });

            }

        }
    );


    /*
        DELETE / DEACTIVATE MEDICINE
    */

    router.delete(
        "/:id",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const result =
                    db.prepare(`
                        UPDATE medicines
                        SET active = 0
                        WHERE id = ?
                        AND patient_id = ?
                    `).run(
                        req.params.id,
                        req.user.id
                    );


                if (result.changes === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Medicine not found."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "Medicine removed."
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to remove medicine."
                });

            }

        }
    );


    return router;
}


module.exports = createMedicineRouter;