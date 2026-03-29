// Greet the console

console.log("Hello World!!! It's me, your ghost")
console.log("Dishing out on local network 8088 -- joeliecakes")

// Sign-up form handling
document.addEventListener('DOMContentLoaded', function() {
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