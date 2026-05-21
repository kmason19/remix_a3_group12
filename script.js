const durationInput = document.getElementById("durationInput");
const totalAmountInput = document.getElementById("totalAmountInput");

const pricePerHour = 10;

function calculateTotal() {
    const duration = Number(durationInput.value);
    const total = pricePerHour * duration;

    totalAmountInput.value = total + "wei";
}

durationInput.addEventListener("change", calculateTotal);

calculateTotal();

