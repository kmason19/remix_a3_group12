const durationInput = document.getElementById("durationInput");
const totalAmountInput = document.getElementById("totalAmountInput");

const summaryDuration = document.getElementById("summaryDuration");
const summaryTotal = document.getElementById("summaryTotal");

const pricePerHour = 10;

function calculateTotal() {
    const duration = Number(durationInput.value);
    const total = pricePerHour * duration;

    totalAmountInput.value = "$" + total;
    summaryDuration.textContent = duration + " hour" + (duration > 1 ? "s" : "");
    summaryTotal.textContent = "$" + total;
}

durationInput.addEventListener("change", calculateTotal);

calculateTotal();

const createBookingBtn = document.getElementById("createBookingBtn");
const transactionStatus = document.getElementById("transactionStatus");
const cancelBookingBtn = document.getElementById("cancelBookingBtn");
const completeBookingBtn = document.getElementById("completeBookingBtn");

createBookingBtn.addEventListener("click", function () {
    transactionStatus.textContent = "Status: Booking submitted successfully.";
});

cancelBookingBtn.addEventListener("click", function () {
    transactionStatus.textContent = "Status: Booking cancelled successfully.";
});

completeBookingBtn.addEventListener("click", function (){
    transactionStatus.textContent = "Status: Booking completed successfully.";
});