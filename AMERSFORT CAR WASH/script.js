document.addEventListener('DOMContentLoaded', () => {
    const adminCredentials = { username: 'admin', password: 'Admin@123' };
    const workerCredentials = [
        { id: 'worker001', password: 'Wash123', name: 'Worker One' },
        { id: 'worker002', password: 'Wash456', name: 'Worker Two' }
    ];

    const app = {
        state: loadState(),
        currentUser: null
    };

    const elements = {
        loginSection: document.getElementById('loginSection'),
        customerLoginPanel: document.getElementById('customerLogin'),
        adminLoginPanel: document.getElementById('adminLogin'),
        workerLoginPanel: document.getElementById('workerLogin'),
        customerSection: document.getElementById('customerSection'),
        adminSection: document.getElementById('adminSection'),
        workerSection: document.getElementById('workerSection'),
        customerName: document.getElementById('customerNameLogin'),
        customerId: document.getElementById('customerIdLogin'),
        adminUser: document.getElementById('adminUser'),
        adminPass: document.getElementById('adminPass'),
        workerId: document.getElementById('workerIdLogin'),
        workerPass: document.getElementById('workerPass'),
        customerLoginMessage: document.getElementById('customerLoginMessage'),
        adminLoginMessage: document.getElementById('adminLoginMessage'),
        workerLoginMessage: document.getElementById('workerLoginMessage'),
        customerWelcome: document.getElementById('customerWelcome'),
        priceSummary: document.getElementById('priceSummary'),
        specialSummary: document.getElementById('specialSummary'),
        eventSummary: document.getElementById('eventSummary'),
        customerBookingForm: document.getElementById('customerBookingForm'),
        bookingStatusList: document.getElementById('bookingStatusList'),
        customerNotifications: document.getElementById('customerNotifications'),
        adminPricesForm: document.getElementById('adminPricesForm'),
        adminSpecialForm: document.getElementById('adminSpecialForm'),
        adminEventsForm: document.getElementById('adminEventsForm'),
        adminPaymentsList: document.getElementById('adminPaymentsList'),
        adminLogList: document.getElementById('adminLogList'),
        adminNotifications: document.getElementById('adminNotifications'),
        workerTasks: document.getElementById('workerTasks'),
        workerReportForm: document.getElementById('workerReportForm'),
        workerNotifications: document.getElementById('workerNotifications'),
        logoutButtons: document.querySelectorAll('.logoutBtn'),
        customerPaymentMethod: document.getElementById('customerPaymentMethod'),
        customerBookingName: document.getElementById('customerBookingName'),
        customerBookingId: document.getElementById('customerBookingId'),
        customerPaymentId: document.getElementById('customerPaymentId'),
        customerVehicleType: document.getElementById('customerVehicleType'),
        workDays: document.getElementById('workDays'),
        workHours: document.getElementById('workHours'),
        bankDetails: document.getElementById('bankDetails'),
        adminBankForm: document.getElementById('adminBankForm'),
        bankName: document.getElementById('bankName'),
        bankAccountNumber: document.getElementById('bankAccountNumber'),
        bankBranchCode: document.getElementById('bankBranchCode'),
        bankAccountHolder: document.getElementById('bankAccountHolder'),
        messageBanner: document.getElementById('messageBanner'),
        roleButtons: document.querySelectorAll('.roleBtn'),
        loginPanels: {
            customer: document.getElementById('customerLogin'),
            admin: document.getElementById('adminLogin'),
            worker: document.getElementById('workerLogin')
        }
    };

    elements.roleButtons.forEach(button => {
        button.addEventListener('click', () => switchLoginPanel(button.dataset.role));
    });

    document.getElementById('customerLoginBtn').addEventListener('click', handleCustomerLogin);
    document.getElementById('adminLoginBtn').addEventListener('click', handleAdminLogin);
    document.getElementById('workerLoginBtn').addEventListener('click', handleWorkerLogin);
    elements.customerBookingForm.addEventListener('submit', handleBookingSubmit);
    elements.adminPricesForm.addEventListener('submit', handleAdminPriceUpdate);
    elements.adminSpecialForm.addEventListener('submit', handleAdminSpecialUpdate);
    elements.adminEventsForm.addEventListener('submit', handleAdminEventsUpdate);
    elements.adminBankForm.addEventListener('submit', handleAdminBankUpdate);
    elements.workerReportForm.addEventListener('submit', handleWorkerReportSubmit);
    elements.logoutButtons.forEach(button => button.addEventListener('click', handleLogout));
    document.addEventListener('click', event => {
        if (event.target.matches('.confirmPaymentBtn')) {
            confirmPayment(event.target.dataset.paymentId);
        }
    });

    renderLogin();

    function loadState() {
        const stored = window.localStorage.getItem('washAppState');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (err) {
                console.warn('Could not parse app state:', err);
            }
        }

        return {
            prices: { private: 80, bakkie: 90, quantum: 120, bus: 150 },
            specials: 'Get 10% off every Monday when you book online.',
            events: 'Weekend shine event: free interior clean for first 10 bookings.',
            workDays: 'Monday - Saturday (closed Sunday)',
            workHours: '8:00 AM - 6:00 PM',
            bankDetails: {
                bankName: '',
                accountNumber: '',
                branchCode: '',
                accountHolder: ''
            },
            payments: [],
            bookings: [],
            reports: [],
            notifications: { customer: [], admin: [], worker: [] }
        };
    }

    function saveState() {
        window.localStorage.setItem('washAppState', JSON.stringify(app.state));
    }

    function switchLoginPanel(role) {
        Object.keys(elements.loginPanels).forEach(key => {
            elements.loginPanels[key].classList.toggle('hidden', key !== role);
        });
    }

    function showSection(section) {
        [elements.loginSection, elements.customerSection, elements.adminSection, elements.workerSection].forEach(sec => {
            sec.classList.toggle('hidden', sec !== section);
        });
    }

    function showMessage(text, type = 'info') {
        elements.messageBanner.textContent = text;
        elements.messageBanner.className = `banner ${type}`;
        elements.messageBanner.classList.remove('hidden');
        setTimeout(() => {
            elements.messageBanner.className = 'banner hidden';
            elements.messageBanner.textContent = '';
        }, 5000);
    }

    function addNotification(role, text) {
        const note = { id: Date.now(), text, when: new Date().toLocaleString() };
        app.state.notifications[role].unshift(note);
        app.state.notifications[role] = app.state.notifications[role].slice(0, 12);
        saveState();
    }

    function handleCustomerLogin() {
        const name = elements.customerName.value.trim();
        const id = elements.customerId.value.trim();
        elements.customerLoginMessage.textContent = '';

        if (!name || !id) {
            elements.customerLoginMessage.textContent = 'Please enter both your name and ID number.';
            return;
        }

        app.currentUser = { role: 'customer', name, id };
        renderCustomerDashboard();
    }

    function handleAdminLogin() {
        const username = elements.adminUser.value.trim();
        const password = elements.adminPass.value.trim();
        elements.adminLoginMessage.textContent = '';

        if (username === adminCredentials.username && password === adminCredentials.password) {
            app.currentUser = { role: 'admin', name: 'Administrator' };
            renderAdminDashboard();
            return;
        }

        elements.adminLoginMessage.textContent = 'Invalid admin credentials.';
    }

    function handleWorkerLogin() {
        const id = elements.workerId.value.trim();
        const password = elements.workerPass.value.trim();
        elements.workerLoginMessage.textContent = '';

        const worker = workerCredentials.find(worker => worker.id === id && worker.password === password);
        if (!worker) {
            elements.workerLoginMessage.textContent = 'Worker ID or password is incorrect.';
            return;
        }

        app.currentUser = { role: 'worker', id: worker.id, name: worker.name };
        renderWorkerDashboard();
    }

    function handleLogout() {
        app.currentUser = null;
        renderLogin();
    }

    function renderLogin() {
        showSection(elements.loginSection);
        switchLoginPanel('customer');
    }

    function formatCurrency(amount) {
        return `R${Number(amount).toFixed(0)}`;
    }

    function renderPriceSummary() {
        elements.priceSummary.innerHTML = `Private: <strong>${formatCurrency(app.state.prices.private)}</strong> · Bakkie: <strong>${formatCurrency(app.state.prices.bakkie)}</strong> · Quantum: <strong>${formatCurrency(app.state.prices.quantum)}</strong> · Bus: <strong>${formatCurrency(app.state.prices.bus)}</strong>`;
        elements.specialSummary.textContent = app.state.specials;
        elements.eventSummary.textContent = app.state.events;
    }

    function renderCustomerDashboard() {
        showSection(elements.customerSection);
        renderPriceSummary();
        elements.customerWelcome.textContent = `Hi ${app.currentUser.name}, you can book your wash online and pay with cash, swipe, or online.`;
        elements.customerBookingName.value = app.currentUser.name;
        elements.customerBookingId.value = app.currentUser.id;
        elements.customerPaymentId.value = app.currentUser.id;
        elements.customerVehicleType.value = 'private';
        elements.customerPaymentMethod.value = 'online';
        elements.workDays.textContent = app.state.workDays;
        elements.workHours.textContent = app.state.workHours;
        renderBankDetails();
        renderCustomerBookings();
        renderNotifications('customer', elements.customerNotifications);
    }

    function renderCustomerBookings() {
        const bookings = app.state.bookings.filter(booking => booking.customerId === app.currentUser.id);
        if (!bookings.length) {
            elements.bookingStatusList.innerHTML = '<div class="empty-state">No bookings yet — book a wash to start tracking your car.</div>';
            return;
        }

        const rows = bookings.map(booking => `
            <tr>
                <td>${booking.createdAt}</td>
                <td>${booking.vehicleType}</td>
                <td>${formatCurrency(booking.amount)}</td>
                <td>${booking.paymentMethod}</td>
                <td>${booking.paymentStatus}</td>
                <td>${booking.status}</td>
            </tr>`).join('');

        elements.bookingStatusList.innerHTML = `
            <table>
                <thead>
                    <tr><th>Date</th><th>Vehicle</th><th>Price</th><th>Payment</th><th>Payment Status</th><th>Wash Status</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    function renderNotifications(role, container) {
        const notes = app.state.notifications[role] || [];
        if (!notes.length) {
            container.innerHTML = '<div class="empty-state">No notifications yet.</div>';
            return;
        }
        container.innerHTML = notes.map(note => `
            <div class="notification">
                <span class="note-time">${note.when}</span>
                <div>${note.text}</div>
            </div>`).join('');
    }

    function renderAdminDashboard() {
        showSection(elements.adminSection);
        renderPriceSummary();
        document.getElementById('adminGreeting').textContent = `Welcome, ${app.currentUser.name}.`;
        document.getElementById('pricePrivate').value = app.state.prices.private;
        document.getElementById('priceBakkie').value = app.state.prices.bakkie;
        document.getElementById('priceQuantum').value = app.state.prices.quantum;
        document.getElementById('priceBus').value = app.state.prices.bus;
        document.getElementById('specialText').value = app.state.specials;
        document.getElementById('eventText').value = app.state.events;
        elements.bankName.value = app.state.bankDetails.bankName;
        elements.bankAccountNumber.value = app.state.bankDetails.accountNumber;
        elements.bankBranchCode.value = app.state.bankDetails.branchCode;
        elements.bankAccountHolder.value = app.state.bankDetails.accountHolder;
        renderAdminPayments();
        renderAdminLogs();
        renderNotifications('admin', elements.adminNotifications);
    }

    function renderAdminPayments() {
        if (!app.state.payments.length) {
            elements.adminPaymentsList.innerHTML = '<div class="empty-state">No payment records have been created.</div>';
            return;
        }

        const rows = app.state.payments.map(payment => `
            <tr>
                <td>${payment.date}</td>
                <td>${payment.customerName}</td>
                <td>${payment.customerId}</td>
                <td>${payment.vehicleType}</td>
                <td>${formatCurrency(payment.amount)}</td>
                <td>${payment.method}</td>
                <td>${payment.status}</td>
                <td>${payment.status === 'Pending' ? `<button class="confirmPaymentBtn" data-payment-id="${payment.id}">Confirm payment</button>` : ''}</td>
            </tr>`).join('');

        elements.adminPaymentsList.innerHTML = `
            <table>
                <thead>
                    <tr><th>Date</th><th>Customer</th><th>ID</th><th>Vehicle</th><th>Amount</th><th>Method</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`;
    }

    function renderAdminLogs() {
        const activity = [...app.state.bookings].slice(0, 10);
        if (!activity.length) {
            elements.adminLogList.innerHTML = '<div class="empty-state">No activity to show yet.</div>';
            return;
        }
        elements.adminLogList.innerHTML = activity.map(booking => `
            <div class="log-entry">
                <strong>${booking.customerName}</strong> booked a ${booking.vehicleType} wash for ${formatCurrency(booking.amount)} — status ${booking.status}
            </div>`).join('');
    }

    function renderWorkerDashboard() {
        showSection(elements.workerSection);
        document.getElementById('workerGreeting').textContent = `Hello ${app.currentUser.name}.`;
        fillWorkerTasks();
        renderNotifications('worker', elements.workerNotifications);
    }

    function fillWorkerTasks() {
        const pendingBookings = app.state.bookings.filter(booking => booking.status !== 'Ready');
        if (!pendingBookings.length) {
            elements.workerTasks.innerHTML = '<div class="empty-state">No active wash tasks to update.</div>';
            return;
        }

        elements.workerTasks.innerHTML = pendingBookings.map(booking => `
            <div class="task-card">
                <div><strong>${booking.customerName}</strong> (${booking.customerId})</div>
                <div>Vehicle: ${booking.vehicleType}</div>
                <div>Price: ${formatCurrency(booking.amount)}</div>
                <div>Payment: ${booking.paymentMethod} / ${booking.paymentStatus}</div>
                <div>Status: ${booking.status}</div>
                <label for='status-${booking.id}'>Update status</label>
                <select id='status-${booking.id}' class='taskStatus' data-id='${booking.id}'>
                    <option value='Waiting' ${booking.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
                    <option value='Washing' ${booking.status === 'Washing' ? 'selected' : ''}>Washing</option>
                    <option value='Ready' ${booking.status === 'Ready' ? 'selected' : ''}>Ready</option>
                </select>
                <label for='note-${booking.id}'>Result notes</label>
                <textarea id='note-${booking.id}' class='taskNote' data-id='${booking.id}' placeholder='Enter notes'></textarea>
            </div>`).join('');
    }

    function handleBookingSubmit(event) {
        event.preventDefault();
        const vehicleType = elements.customerVehicleType.value;
        const paymentMethod = elements.customerPaymentMethod.value;
        const paymentId = elements.customerPaymentId.value.trim();

        if (paymentId !== app.currentUser.id) {
            showMessage('Your secure payment ID must match your login ID.', 'error');
            return;
        }

        const amount = app.state.prices[vehicleType];
        const paymentStatus = 'Pending';
        const booking = {
            id: `BKG-${Date.now()}`,
            createdAt: new Date().toLocaleString(),
            customerName: app.currentUser.name,
            customerId: app.currentUser.id,
            vehicleType,
            amount,
            paymentMethod,
            paymentStatus,
            status: 'Waiting'
        };

        app.state.bookings.unshift(booking);
        app.state.payments.unshift({
            id: `PAY-${Date.now()}`,
            bookingId: booking.id,
            date: booking.createdAt,
            customerName: booking.customerName,
            customerId: booking.customerId,
            vehicleType: booking.vehicleType,
            amount: booking.amount,
            method: booking.paymentMethod,
            status: paymentStatus
        });

        addNotification('customer', `Booking reserved. Your ${paymentMethod} payment is pending until verified.`);
        addNotification('admin', `Payment pending for ${booking.customerName} (${booking.customerId}). Verify and confirm once received.`);
        addNotification('worker', `New booking reserved for ${booking.customerName}. Waiting for payment confirmation.`);
        showMessage('Booking reserved. Payment will be confirmed after actual payment is verified.', 'success');

        saveState();
        renderCustomerBookings();
        renderNotifications('customer', elements.customerNotifications);
        renderAdminPayments();
        renderAdminLogs();
        fillWorkerTasks();
    }

    function handleAdminPriceUpdate(event) {
        event.preventDefault();
        app.state.prices.private = Number(document.getElementById('pricePrivate').value) || app.state.prices.private;
        app.state.prices.bakkie = Number(document.getElementById('priceBakkie').value) || app.state.prices.bakkie;
        app.state.prices.quantum = Number(document.getElementById('priceQuantum').value) || app.state.prices.quantum;
        app.state.prices.bus = Number(document.getElementById('priceBus').value) || app.state.prices.bus;
        saveState();
        renderPriceSummary();
        showMessage('Price list successfully updated.', 'success');
    }

    function handleAdminSpecialUpdate(event) {
        event.preventDefault();
        app.state.specials = document.getElementById('specialText').value.trim() || app.state.specials;
        saveState();
        renderPriceSummary();
        showMessage('Specials updated successfully.', 'success');
    }

    function handleAdminEventsUpdate(event) {
        event.preventDefault();
        app.state.events = document.getElementById('eventText').value.trim() || app.state.events;
        saveState();
        renderPriceSummary();
        showMessage('Special events updated successfully.', 'success');
    }

    function handleAdminBankUpdate(event) {
        event.preventDefault();
        app.state.bankDetails.bankName = elements.bankName.value.trim();
        app.state.bankDetails.accountNumber = elements.bankAccountNumber.value.trim();
        app.state.bankDetails.branchCode = elements.bankBranchCode.value.trim();
        app.state.bankDetails.accountHolder = elements.bankAccountHolder.value.trim();
        saveState();
        renderBankDetails();
        showMessage('Online payment bank details saved.', 'success');
    }

    function renderBankDetails() {
        const bank = app.state.bankDetails;
        if (!bank.bankName && !bank.accountNumber && !bank.branchCode && !bank.accountHolder) {
            elements.bankDetails.textContent = 'Bank details will appear here once the admin links them.';
            return;
        }
        elements.bankDetails.innerHTML = `
            <div><strong>Bank:</strong> ${bank.bankName || 'TBD'}</div>
            <div><strong>Account holder:</strong> ${bank.accountHolder || 'TBD'}</div>
            <div><strong>Account number:</strong> ${bank.accountNumber || 'TBD'}</div>
            <div><strong>Branch code:</strong> ${bank.branchCode || 'TBD'}</div>
            <div class='help-text'>Use these details for online payments or ask the admin for confirmation.</div>
        `;
    }

    function handleWorkerReportSubmit(event) {
        event.preventDefault();
        const statusSelectors = document.querySelectorAll('.taskStatus');
        const notes = document.querySelectorAll('.taskNote');
        let changed = false;

        statusSelectors.forEach(select => {
            const id = select.dataset.id;
            const booking = app.state.bookings.find(item => item.id === id);
            if (!booking) return;

            if (booking.status !== select.value) {
                booking.status = select.value;
                changed = true;
                if (select.value === 'Ready') {
                    addNotification('customer', `Your ${booking.vehicleType} is ready for pickup.`);
                    addNotification('admin', `Wash completed for ${booking.customerName}. Ready for pickup.`);
                }
            }
        });

        notes.forEach(noteArea => {
            const id = noteArea.dataset.id;
            const noteText = noteArea.value.trim();
            if (!noteText) return;
            const booking = app.state.bookings.find(item => item.id === id);
            if (!booking) return;
            app.state.reports.unshift({
                id: `RPT-${Date.now()}`,
                bookingId: booking.id,
                workerId: app.currentUser.id,
                workerName: app.currentUser.name,
                note: noteText,
                date: new Date().toLocaleString()
            });
            noteArea.value = '';
            changed = true;
        });

        if (!changed) {
            showMessage('No task updates were submitted.', 'error');
            return;
        }

        saveState();
        fillWorkerTasks();
        renderCustomerBookings();
        renderAdminLogs();
        renderNotifications('worker', elements.workerNotifications);
        showMessage('Worker reports and statuses updated.', 'success');
    }

    function confirmPayment(paymentId) {
        const payment = app.state.payments.find(item => item.id === paymentId);
        if (!payment) {
            showMessage('Payment record not found.', 'error');
            return;
        }
        if (payment.status === 'Paid') {
            showMessage('This payment is already confirmed.', 'info');
            return;
        }

        payment.status = 'Paid';
        const booking = app.state.bookings.find(b => b.id === payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'Paid';
        }
        saveState();

        addNotification('customer', `Payment confirmed for ${payment.customerName}. Your wash can now proceed.`);
        addNotification('admin', `Payment confirmed for ${payment.customerName} (${payment.customerId}).`);
        addNotification('worker', `Payment verified for ${payment.customerName}. Start the wash when ready.`);

        renderAdminPayments();
        renderAdminLogs();
        fillWorkerTasks();
        if (app.currentUser?.role === 'customer' && app.currentUser.id === payment.customerId) {
            renderCustomerBookings();
            renderNotifications('customer', elements.customerNotifications);
        }
        showMessage('Payment confirmed and booking marked as paid.', 'success');
    }
});
