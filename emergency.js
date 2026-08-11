"use strict";

const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireRole
} = require("../middleware/auth");


function createEmergencyRouter(db) {

    /*
        CREATE EMERGENCY ALERT
    */

    router.post(
        "/",
        authenticateToken,
        requireRole("patient"),
        (req, res) => {

            try {

                const {
                    latitude,
                    longitude,
                    message
                } = req.body;


                const result =
                    db.prepare(`
                        INSERT INTO emergency_alerts
                        (
                            patient_id,
                            latitude,
                            longitude,
                            message,
                            status
                        )
                        VALUES (?, ?, ?, ?, 'active')
                    `).run(
                        req.user.id,
                        latitude || null,
                        longitude || null,
                        message ||
                            "Emergency SOS activated."
                    );


                res.status(201).json({
                    success: true,
                    message:
                        "Emergency alert activated.",
                    alertId:
                        result.lastInsertRowid
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to activate emergency alert."
                });

            }

        }
    );


    /*
        GET ACTIVE EMERGENCIES
    */

    router.get(
        "/active",
        authenticateToken,
        requireRole("doctor", "admin"),
        (req, res) => {

            try {

                const alerts =
                    db.prepare(`
                        SELECT
                            e.*,
                            u.name AS patient_name,
                            u.phone AS patient_phone
                        FROM emergency_alerts e
                        JOIN users u
                            ON u.id = e.patient_id
                        WHERE e.status = 'active'
                        ORDER BY e.created_at DESC
                    `).all();


                res.json({
                    success: true,
                    alerts
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to load emergency alerts."
                });

            }

        }
    );


    /*
        RESOLVE EMERGENCY
    */

    router.patch(
        "/:id/resolve",
        authenticateToken,
        requireRole("doctor", "admin"),
        (req, res) => {

            try {

                const result =
                    db.prepare(`
                        UPDATE emergency_alerts
                        SET
                            status = 'resolved',
                            resolved_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                        AND status = 'active'
                    `).run(
                        req.params.id
                    );


                if (result.changes === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Emergency alert not found."
                    });

                }


                res.json({
                    success: true,
                    message:
                        "Emergency alert resolved."
                });

            } catch (error) {

                console.error(error);

                res.status(500).json({
                    success: false,
                    message:
                        "Unable to resolve alert."
                });

            }

        }
    );


    return router;
}


module.exports = createEmergencyRouter;