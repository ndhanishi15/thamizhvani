"use strict";


const API = "/api";


const SmartCare = {

    token: localStorage.getItem(
        "smartcare_token"
    ),


    user:
        JSON.parse(
            localStorage.getItem(
                "smartcare_user"
            ) || "null"
        ),


    async request(
        endpoint,
        options = {}
    ) {

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };


        if (this.token) {

            headers.Authorization =
                `Bearer ${this.token}`;

        }


        const response =
            await fetch(
                `${API}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Something went wrong."
            );

        }


        return data;

    },


    async login(
        email,
        password
    ) {

        const data =
            await this.request(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        this.token =
            data.token;

        this.user =
            data.user;


        localStorage.setItem(
            "smartcare_token",
            this.token
        );


        localStorage.setItem(
            "smartcare_user",
            JSON.stringify(this.user)
        );


        return data;

    },


    logout() {

        localStorage.removeItem(
            "smartcare_token"
        );

        localStorage.removeItem(
            "smartcare_user"
        );

        window.location.href =
            "index.html";

    },


    isLoggedIn() {

        return Boolean(
            this.token
        );

    },


    showToast(
        message,
        type = "success"
    ) {

        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            `smart-toast ${type}`;


        toast.innerHTML = `
            <strong>
                ${type === "success" ? "✓" : "!"}
            </strong>

            <span>
                ${message}
            </span>
        `;


        document.body.appendChild(
            toast
        );


        requestAnimationFrame(() => {

            toast.classList.add(
                "show"
            );

        });


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 3000);

    }

};