document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("contactFormStatus");

    if (!form || !status) {
        return;
    }

    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const submitButton = form.querySelector(".submit-button");

    function setStatus(message, type = "") {
        status.textContent = message;
        status.classList.remove("is-error", "is-success");

        if (type) {
            status.classList.add(`is-${type}`);
        }
    }

    function getFieldError(field) {
        const value = field.value.trim();

        if (!value) {
            return "Completá este campo.";
        }

        if (field.type === "email" && field.validity.typeMismatch) {
            return "Ingresá un correo electrónico válido.";
        }

        return "";
    }

    function updateFieldState(field) {
        const isTouched = field.dataset.touched === "true";
        const errorMessage = getFieldError(field);
        const showInvalidState = isTouched && Boolean(errorMessage);

        field.classList.toggle("is-invalid", showInvalidState);
        field.setAttribute("aria-invalid", showInvalidState ? "true" : "false");

        return errorMessage;
    }

    function resetFieldState(field) {
        field.dataset.touched = "false";
        field.classList.remove("is-invalid");
        field.setAttribute("aria-invalid", "false");
    }

    function animateSubmitButton() {
        if (!submitButton) {
            return;
        }

        submitButton.classList.remove("is-sending");
        submitButton.getBoundingClientRect();
        submitButton.classList.add("is-sending");

        window.setTimeout(() => {
            submitButton.classList.remove("is-sending");
        }, 820);
    }

    fields.forEach((field) => {
        resetFieldState(field);

        field.addEventListener("blur", () => {
            field.dataset.touched = "true";
            updateFieldState(field);
        });

        field.addEventListener("input", () => {
            if (field.dataset.touched === "true") {
                updateFieldState(field);
            }

            if (status.textContent) {
                setStatus("");
            }
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let firstInvalidField = null;

        fields.forEach((field) => {
            field.dataset.touched = "true";
            const errorMessage = updateFieldState(field);

            if (!firstInvalidField && errorMessage) {
                firstInvalidField = field;
            }
        });

        if (firstInvalidField) {
            setStatus("Revisá los campos marcados antes de enviar la consulta.", "error");
            firstInvalidField.focus();
            return;
        }

        const formData = Object.fromEntries(new FormData(form).entries());
        const subject = encodeURIComponent(`Consulta desde el sitio web - ${formData.nombre}`);
        const body = encodeURIComponent(
            [
                "Hola, quisiera recibir asesoramiento.",
                "",
                `Nombre: ${formData.nombre}`,
                `Teléfono: ${formData.telefono}`,
                `Correo electrónico: ${formData.email}`,
                "",
                "Mensaje:",
                formData.mensaje
            ].join("\n")
        );

        animateSubmitButton();
        setStatus("Abrimos tu cliente de correo para completar el envío.", "success");

        window.setTimeout(() => {
            window.location.href = `mailto:estudio@somos-sc.com.ar?subject=${subject}&body=${body}`;
            form.reset();
            fields.forEach(resetFieldState);
        }, 180);
    });
});
