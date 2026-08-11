"use strict";

const express = require("express");

const router = express.Router();


function createDoctorRouter(db) {

    /*
        GET ALL DOCTORS
    */

    router.get("/", (req, res) => {

        try {

            const {
                specialty,
                search
            } = req.query;


            let sql = `
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u.phone,
                    d.specialty,
                    d.qualification,
                    d.experience_years,
                    d.consultation_fee,
                    d.location,
                    d.bio,
                    d.rating,
                    d.available
                FROM users u
                JOIN doctor_profiles d
                    ON d.user_id = u.id
                WHERE u.role = 'doctor'
            `;


            const params = [];


            if (specialty) {

                sql += `
                    AND d.specialty = ?
                `;

                params.push(specialty);

            }


            if (search) {

                sql += `
                    AND (
                        u.name LIKE ?
                        OR d.specialty LIKE ?
                    )
                `;

                const query =
                    `%${search}%`;

                params.push(query);
                params.push(query);

            }


            sql += `
                ORDER BY
                    d.rating DESC,
                    u.name ASC
            `;


            const doctors =
                db.prepare(sql).all(...params);


            res.json({
                success: true,
                doctors
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Unable to load doctors."
            });

        }

    });


    /*
        GET SINGLE DOCTOR
    */

    router.get("/:id", (req, res) => {

        try {

            const doctor =
                db.prepare(`
                    SELECT
                        u.id,
                        u.name,
                        u.email,
                        d.specialty,
                        d.qualification,
                        d.experience_years,
                        d.consultation_fee,
                        d.location,
                        d.bio,
                        d.rating,
                        d.available
                    FROM users u
                    JOIN doctor_profiles d
                        ON d.user_id = u.id
                    WHERE u.id = ?
                    AND u.role = 'doctor'
                `).get(
                    req.params.id
                );


            if (!doctor) {

                return res.status(404).json({
                    success: false,
                    message: "Doctor not found."
                });

            }


            res.json({
                success: true,
                doctor
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Unable to load doctor."
            });

        }

    });


    return router;
}


module.exports = createDoctorRouter;