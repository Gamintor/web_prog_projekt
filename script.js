// Varijabla koja drži podatke o ulogiranom korisniku
let loggedUser = null;

document.addEventListener('DOMContentLoaded', () => {
	// Provjeri postoji li korisnik u sesiji
	const savedUser = sessionStorage.getItem('eLibUser');
	if (savedUser) {
		handleLoginSuccess(JSON.parse(savedUser));
	} else {
		prikaziLogin();
	}

	// Event listenjeri
	document.getElementById('login-form').addEventListener('submit', doLogin);
	document.getElementById('register-form').addEventListener('submit', doRegister);
	document.getElementById('add-book-form').addEventListener('submit', dodajKnjigu);
});

// --- NAVIGACIJA I PRIKAZ ---

function sakrijSve() {
	document.getElementById('view-login').style.display = 'none';
	document.getElementById('view-register').style.display = 'none';
	document.getElementById('view-katalog').style.display = 'none';
	document.getElementById('view-admin').style.display = 'none';
	document.getElementById('view-posudbe').style.display = 'none';
}

function prikaziLogin() {
	sakrijSve();
	document.getElementById('view-login').style.display = 'block';
}

function prikaziRegistraciju() {
	sakrijSve();
	document.getElementById('view-register').style.display = 'block';
}

function prikaziKatalog() {
	if (!loggedUser) return prikaziLogin();
	sakrijSve();
	document.getElementById('view-katalog').style.display = 'block';
	ucitajKnjige();
}

function prikaziAdmin() {
	if (!loggedUser || loggedUser.role !== 'admin') {
		alert('Nemate pristup!');
		return;
	}
	sakrijSve();
	document.getElementById('view-admin').style.display = 'block';
	ucitajSvePosudbe();
}

function ucitajSvePosudbe() {
	fetch('api/dohvati_sve_posudbe.php')
		.then(res => res.json())
		.then(data => {
			const lista = document.getElementById('admin-posudbe-list');
			lista.innerHTML = '';

			data.forEach(p => {
				const tr = document.createElement('tr');
				const jeAktivna = p.status === 'aktivno';
				console.log(`aktivna: ${jeAktivna}`);
				console.log(p);
				
				tr.innerHTML = `
					<td>${p.korisnik}</td>
					<td>${p.naslov}</td>
					<td>${new Date(p.datum).toLocaleDateString('hr-HR')}</td>
					<td>
						<span class="${jeAktivna ? 'status-aktivno' : 'status-vraceno'}">${p.status || 'aktivno'}</span>
					</td>
					<td>
						${jeAktivna ? `<button class="btn-save" onClick="evidentirajPovrat('${p.id}', '${p.knjiga_id}')">Vrati</button>` : '-'}
					</td>
				`;
				lista.appendChild(tr);
			});
		});
}

function evidentirajPovrat(loanID, bookID) {
	if(!confirm("Potvrdi povrat knjige?")) return;

	fetch('api/vrati_knjigu.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({loan_id: loanID, book_id: bookID})
	})
	.then(res => res.json())
	.then(data => {
		alert(data.message);
		ucitajSvePosudbe();
	});
}


function azurirajNavigaciju() {
	const isLogged = loggedUser !== null;
	const isAdmin = isLogged && loggedUser.role === 'admin';

	// Toggle linkova
	document.getElementById('nav-login').style.display = isLogged ? 'none' : 'block';
	document.getElementById('nav-register').style.display = isLogged ? 'none' : 'block';

	document.getElementById('nav-katalog').style.display = isLogged ? 'block' : 'none';
	document.getElementById('nav-logout').style.display = isLogged ? 'block' : 'none';
	document.getElementById('nav-posudbe').style.display = isLogged && !isAdmin ? 'block' : 'none';
	document.getElementById('nav-admin').style.display = isAdmin ? 'block' : 'none';

	// User info
	document.getElementById('user-display').style.display = isLogged ? 'block' : 'none';
	if (isLogged) {
		document.getElementById('current-user-name').innerText = loggedUser.ime + ' (' + loggedUser.role + ')';
	}
}

// --- AUTENTIFIKACIJA (AJAX) ---

function doRegister(e) {
	e.preventDefault();
	const data = {
		ime: document.getElementById('reg-ime').value,
		email: document.getElementById('reg-email').value,
		password: document.getElementById('reg-pass').value,
	};

	fetch('api/register.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	})
		.then(res => res.json())
		.then(resp => {
			if (resp.status === 'success') {
				alert(resp.message);
				prikaziLogin();
			} else {
				alert(resp.message);
			}
		});
}

function doLogin(e) {
	e.preventDefault();
	const data = {
		email: document.getElementById('login-email').value,
		password: document.getElementById('login-pass').value,
	};

	fetch('api/login.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	})
		.then(res => res.json())
		.then(resp => {
			if (resp.status === 'success') {
				handleLoginSuccess(resp.user);
			} else {
				alert(resp.message);
			}
		});
}

function handleLoginSuccess(user) {
	loggedUser = user;
	sessionStorage.setItem('eLibUser', JSON.stringify(user));
	azurirajNavigaciju();
	prikaziKatalog();
}

function odjaviSe() {
	loggedUser = null;
	sessionStorage.removeItem('eLibUser');
	azurirajNavigaciju();
	prikaziLogin();
}

// FUNKCIONALNOST KNJIGA

function ucitajKnjige() {
	fetch('api/dohvat.php')
		.then(response => response.json())
		.then(data => {
			const grid = document.getElementById('knjige-grid');
			grid.innerHTML = '';

			if (!data || data.length === 0) {
				grid.innerHTML = '<p>Nema knjiga.</p>';
				return;
			}

			data.forEach(knjiga => {
				const div = document.createElement('div');
				div.className = 'card';

				let akcijskiGumbi = '';

				if (loggedUser.role === 'admin') {
					akcijskiGumbi = `
						<button class="btn-edit" onClick="otvoriEditModal('${knjiga.id}', '${knjiga.naslov}', '${knjiga.autor}', '${knjiga.kolicina}')">Uredi</button>
						<button class="btn-delete" onClick="obrisiKnjigu('${knjiga.id}')">Obriši</button>
						`;
				} else {
					akcijskiGumbi = `
                        <button 
                            onclick="posudiKnjigu('${knjiga.id}', ${knjiga.kolicina}, '${knjiga.naslov}')" 
                            ${knjiga.kolicina <= 0 ? 'disabled' : ''}>
                            ${knjiga.kolicina > 0 ? 'Posudi' : 'Nedostupno'}
                        </button>
                    `;
				}
				div.innerHTML = `
                    <img src="${knjiga.slika}" alt="Cover">
                    <h3>${knjiga.naslov}</h3>
                    <p>${knjiga.autor}</p>
                    <p>Dostupno: <strong>${knjiga.kolicina}</strong></p>
                    ${akcijskiGumbi}
                `;
				grid.appendChild(div);
			});
		});
}

function dodajKnjigu(e) {
	e.preventDefault();

	if (loggedUser.role !== 'admin') return alert('Samo admin!');

	const podaci = {
		naslov: document.getElementById('naslov').value,
		autor: document.getElementById('autor').value,
		kolicina: document.getElementById('kolicina').value,
	};

	fetch('api/dodaj.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(podaci),
	})
		.then(res => res.json())
		.then(data => {
			alert('Knjiga dodana!');
			document.getElementById('add-book-form').reset();
		});
}

function posudiKnjigu(id, trenutnaKolicina, naslov) {
	if (!confirm('Posudi ovu knjigu?')) return;

	fetch('api/posudi.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			book_id: id,
			book_title: naslov,
			user_name: loggedUser.ime,
			current_qty: trenutnaKolicina,
		}),
	})
		.then(res => res.json())
		.then(data => {
			alert(data.message);
			ucitajKnjige();
		});
}

function obrisiKnjigu(id) {
	if (!confirm('Jeste li sigurni da želite obrisati ovu knjigu?')) return;

	fetch('api/obrisi.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: id }),
	})
		.then(res => res.json())
		.then(data => {
			alert(data.message);
			ucitajKnjige();
		});
}

const modal = document.getElementById('edit-modal');

function zatvoriModal() {
	modal.style.display = 'none';
}

function otvoriEditModal(id, naslov, autor, kolicina) {
	document.getElementById('edit-id').value = id;
	document.getElementById('edit-naslov').value = naslov;
	document.getElementById('edit-autor').value = autor;
	document.getElementById('edit-kolicina').value = kolicina;
	modal.style.display = 'block';
}

document.getElementById('edit-book-form').addEventListener('submit', function (e) {
	e.preventDefault();

	const podaci = {
		id: document.getElementById('edit-id').value,
		naslov: document.getElementById('edit-naslov').value,
		autor: document.getElementById('edit-autor').value,
		kolicina: document.getElementById('edit-kolicina').value,
	};

	fetch('api/uredi.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(podaci),
	})
		.then(res => res.json())
		.then(data => {
			alert(data.message);
			zatvoriModal();
			ucitajKnjige();
		});
});

window.onclick = function (event) {
	if (event.target == modal) {
		zatvoriModal();
	}
};

function prikaziMojePosudbe() {
	if(!loggedUser) return prikaziLogin();

	sakrijSve();
	document.getElementById('view-posudbe').style.display = 'block';

	const lista = document.getElementById('lista-mojih-posudbi');
	lista.innerHTML = '<tr><td colspan="3">Učitavanje...</td></tr>';
	
	fetch(`api/moje_posudbe.php?user_name=${encodeURIComponent(loggedUser.ime)}` )
		.then(res => res.json())
		.then(data => {
			lista.innerHTML = '';

			if(data.length === 0) {
				lista.innerHTML = '<tr><td colspan="3">Nemate aktivnih posudbi!</td></tr>';
				return;
			}

			data.forEach(p => {
				const tr = document.createElement('tr');
				const naslov = p.naslov;
				const statusKlasa = p.status === 'aktivno' ? 'status-aktivno' : 'status-vraceno';

				tr.innerHTML = `
					<td>${naslov}</td>
					<td>${new Date(p.datum).toLocaleDateString('hr-HR')}</td>
				    <td><span class="${statusKlasa}">${p.status || 'aktivno'}</span></td>
				`;
				lista.appendChild(tr);
			});
		});
}