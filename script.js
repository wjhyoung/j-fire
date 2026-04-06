// Greet the console

console.log("Hello World!!! It's me, your ghost")
console.log("Dishing out on local network 8088 -- joeliecakes")

// Sign-up form handling
document.addEventListener('DOMContentLoaded', function() {
    // Set min date for enrollment start
    const enrollmentStartInput = document.getElementById('enrollment-start');
    if (enrollmentStartInput) {
        const today = new Date().toISOString().split('T')[0];
        enrollmentStartInput.min = today;
    }
    const signupForm = document.querySelector('.form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const email = document.getElementById('email').value;
            
            // Basic validation
            if (username && password && email) {
                alert(`Sign-up successful!\nUsername: ${username}\nEmail: ${email}`);
                // In a real app, send data to server
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Sign-in form handling
    const signinForm = document.querySelector('.signin-form');
    if (signinForm) {
        signinForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            const username = document.getElementById('signin-username').value;
            const password = document.getElementById('signin-password').value;
            
            // Basic validation
            if (username && password) {
                alert(`Sign-in successful!\nWelcome back, ${username}!`);
                // In a real app, verify credentials with server
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Budget entry form handling
    const budgetForm = document.querySelector('.budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            const budgetName = document.getElementById('budget-name').value;
            const fixedCostsText = document.getElementById('fixed-costs').value;
            const variableCostsText = document.getElementById('variable-costs').value;
            
            // Basic validation
            if (budgetName) {
                // Parse costs (simple parsing, assuming format "Name: Amount")
                const fixedCosts = parseCosts(fixedCostsText);
                const variableCosts = parseCosts(variableCostsText);
                
                const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
                const totalVariable = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
                const total = totalFixed + totalVariable;
                
                alert(`Budget "${budgetName}" saved!\nFixed Costs Total: $${totalFixed}\nVariable Costs Total: $${totalVariable}\nGrand Total: $${total}`);
                // In a real app, send data to server
            } else {
                alert('Please enter a budget name.');
            }
        });
    }

    // Finance overview form handling
    const financeForm = document.querySelector('.finance-form');
    if (financeForm) {
        financeForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            const enrollmentStart = document.getElementById('enrollment-start').value;
            const patientsLow = parseInt(document.getElementById('patients-low').value);
            const patientsHigh = parseInt(document.getElementById('patients-high').value);
            const screenFailRate = parseFloat(document.getElementById('screen-fail-rate').value);
            const closeOutDate = document.getElementById('close-out-date').value;
            const overheadRate = parseFloat(document.getElementById('overhead-rate').value);
            const inflationRate = parseFloat(document.getElementById('inflation-rate').value);
            
            // Basic validation
            const today = new Date().toISOString().split('T')[0];
            if (enrollmentStart < today) {
                alert('Enrollment start date must be in the future.');
                return;
            }
            if (patientsLow > patientsHigh) {
                alert('Low patients enrolled cannot be higher than high patients enrolled.');
                return;
            }
            if (screenFailRate < 0 || screenFailRate > 100) {
                alert('Screen fail rate must be between 0 and 100.');
                return;
            }
            
            alert(`Finance overview submitted!\nEnrollment Start: ${enrollmentStart}\nPatients: ${patientsLow} - ${patientsHigh}\nScreen Fail Rate: ${screenFailRate}%\nClose Out Date: ${closeOutDate}\nOverhead Rate: ${overheadRate}%\nInflation Rate: ${inflationRate}%`);
            // In a real app, process the data for budgeting
        });
    }
});

// Helper function to parse costs from textarea
function parseCosts(text) {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
        const parts = line.split(':');
        const name = parts[0]?.trim() || 'Unnamed';
        const amount = parseFloat(parts[1]?.trim()) || 0;
        return { name, amount };
    });
}

// Learning function for console
// (function () {
//   "use strict";
//   /* Start of your code */
//   function greetMe(yourName) {
//     alert(`Hello ${yourName}`);
//   }

//   greetMe("World");
//   /* End of your code */
// })();

