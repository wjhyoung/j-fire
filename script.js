// J Fire Scripts
let progress = 0.1

let weeks = (80 * progress)

console.log(weeks)

console.log("Building logic for site, dishing on 8000, for the next " + weeks + " weeks...")

// Budget form data persistence via localStorage

// Sign-up form handling
document.addEventListener('DOMContentLoaded', function () {
    // Set min date for enrollment start
    const enrollmentStartInput = document.getElementById('enrollment-start');
    if (enrollmentStartInput) {
        const today = new Date().toISOString().split('T')[0];
        enrollmentStartInput.min = today;
    }
    const signupForm = document.querySelector('.form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
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
        signinForm.addEventListener('submit', function (event) {
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
    const loadBudgetButton = document.getElementById('load-budget');
    const budgetLoadResult = document.getElementById('budget-load-result');

    if (budgetForm) {
        budgetForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            const budgetName = document.getElementById('budget-name').value.trim();
            const sponsorName = document.getElementById('sponsor-name').value.trim();
            const protocolName = document.getElementById('protocol-name').value.trim();
            const studyName = document.getElementById('study-name').value.trim();
            const diseaseName = document.getElementById('disease-name').value.trim();
            const categoryName = document.getElementById('category-name').value.trim();
            const initialContactDate = document.getElementById('initial-date').value.trim();

            // Basic validation
            if (!budgetName || !sponsorName || !protocolName || !studyName || !diseaseName || !categoryName || !initialContactDate) {
                alert('Please fill in all required project fields.');
                return;
            }

            const budgetEntry = {
                budgetName,
                sponsorName,
                protocolName,
                studyName,
                diseaseName,
                categoryName,
                initialContactDate,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('budgetEntry', JSON.stringify(budgetEntry));

            alert(`Project saved!\nProject: ${budgetName}\nSponsor: ${sponsorName}\nProtocol: ${protocolName}`);

            if (budgetLoadResult) {
                budgetLoadResult.textContent = 'Budget saved successfully. Click "Load saved project" to retrieve it.';
            }
        });
    }

    if (loadBudgetButton) {
        loadBudgetButton.addEventListener('click', function () {
            const savedBudgetJson = localStorage.getItem('budgetEntry');
            if (!savedBudgetJson) {
                if (budgetLoadResult) {
                    budgetLoadResult.textContent = 'No saved project found in local storage.';
                }
                return;
            }

            try {
                const savedBudget = JSON.parse(savedBudgetJson);
                document.getElementById('budget-name').value = savedBudget.budgetName || '';
                document.getElementById('sponsor-name').value = savedBudget.sponsorName || '';
                document.getElementById('protocol-name').value = savedBudget.protocolName || '';
                document.getElementById('study-name').value = savedBudget.studyName || '';
                document.getElementById('disease-name').value = savedBudget.diseaseName || '';
                document.getElementById('category-name').value = savedBudget.categoryName || '';
                document.getElementById('initial-date').value = savedBudget.initialContactDate || '';

                if (budgetLoadResult) {
                    budgetLoadResult.innerHTML = `
                        <p><strong>Loaded saved project:</strong></p>
                        <ul>
                            <li><strong>Project:</strong> ${savedBudget.budgetName || '—'}</li>
                            <li><strong>Sponsor:</strong> ${savedBudget.sponsorName || '—'}</li>
                            <li><strong>Protocol:</strong> ${savedBudget.protocolName || '—'}</li>
                            <li><strong>Study title:</strong> ${savedBudget.studyName || '—'}</li>
                            <li><strong>Disease:</strong> ${savedBudget.diseaseName || '—'}</li>
                            <li><strong>Category:</strong> ${savedBudget.categoryName || '—'}</li>
                            <li><strong>Initial contact:</strong> ${savedBudget.initialContactDate || '—'}</li>
                            <li><strong>Saved at:</strong> ${savedBudget.savedAt ? new Date(savedBudget.savedAt).toLocaleString() : '—'}</li>
                        </ul>
                    `;
                }
            } catch (error) {
                console.error('Error parsing saved budget:', error);
                if (budgetLoadResult) {
                    budgetLoadResult.textContent = 'Could not load saved project. Data may be corrupted.';
                }
            }
        });
    }

    // Finance overview form handling
    const financeForm = document.querySelector('.finance-form');
    if (financeForm) {
        financeForm.addEventListener('submit', function (event) {
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

            const financeSummary = document.getElementById('finance-summary');
            if (financeSummary) {
                const expectedLow = Math.round(patientsLow * (1 - screenFailRate / 100));
                const expectedHigh = Math.round(patientsHigh * (1 - screenFailRate / 100));
                financeSummary.innerHTML = `
                    <p><strong>Finance Summary</strong></p>
                    <ul>
                        <li>Enrollment Start: ${enrollmentStart}</li>
                        <li>Close Out Date: ${closeOutDate}</li>
                        <li>Patient range: ${patientsLow} - ${patientsHigh}</li>
                        <li>Expected after screen failure: ${expectedLow} - ${expectedHigh}</li>
                        <li>Screen Fail Rate: ${screenFailRate.toFixed(2)}%</li>
                        <li>Overhead Rate: ${overheadRate.toFixed(2)}%</li>
                        <li>Inflation Rate: ${inflationRate.toFixed(2)}%</li>
                    </ul>
                `;
            }
            // In a real app, process the data for budgeting
        });
    }

    // Fixed cost calculator handling
    const fixedCostForm = document.querySelector('.fixed-cost-form');
    if (fixedCostForm) {
        fixedCostForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const fieldIds = [
                'initial-feasibility-review',
                'lab-setup',
                'mri-setup',
                'basic-startup-cost',
                'yearly-ethics-review',
                'pharmacy-maintenance',
                'annual-fee',
                'labor'
            ];

            const totalFixedCosts = fieldIds.reduce((sum, id) => {
                const value = parseFloat(document.getElementById(id).value);
                return sum + (isNaN(value) ? 0 : value);
            }, 0);

            const output = document.getElementById('fixed-cost-total');
            if (output) {
                output.textContent = `Total fixed costs: $${formatCurrency(totalFixedCosts)}`;
            }
        });
    }

    // Variable cost calculator handling
    const variableCostForm = document.querySelector('.variable-cost-form');
    if (variableCostForm) {
        variableCostForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const fieldIds = [
                'professional-fees',
                'mri',
                'nursing',
                'administration',
                'pi-fees',
                'coordinator-fees',
                'supplies',
                'lab-time'
            ];

            const totalVariableCosts = fieldIds.reduce((sum, id) => {
                const value = parseFloat(document.getElementById(id).value);
                return sum + (isNaN(value) ? 0 : value);
            }, 0);

            const output = document.getElementById('variable-cost-total');
            if (output) {
                output.textContent = `Total variable costs: $${formatCurrency(totalVariableCosts)}`;
                console.log(`Total variable costs: $${formatCurrency(totalVariableCosts)}`);
            }
        });
    }
    

    
});


function formatCurrency(amount) {
    return amount.toFixed(2);
}



// Running total update instantly
const inputs = document.querySelectorAll('.amount');
const totalDisplay = document.getElementById('total');

inputs.forEach(input => {
    input.addEventListener('input', updateTotal);
});

function updateTotal() {
    let sum = 0;
    inputs.forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    totalDisplay.textContent = '$' + sum.toFixed(2);
}
