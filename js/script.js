/************** Firebase Config *****************/
const firebaseConfig = {
  apiKey: "AIzaSyDW0vYUIv7IdJ0_pycuAB76UJLYVRfKLQY",
  authDomain: "fir-web-3d27a.firebaseapp.com",
  projectId: "fir-web-3d27a",
  storageBucket: "fir-web-3d27a.firebasestorage.app",
  messagingSenderId: "577325180059",
  appId: "1:577325180059:web:f1b49a25e0c802394d523e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {

  /********** NAVBAR Y MODALES **********/
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginFormModal = document.getElementById("loginForm");
  const registerFormModal = document.getElementById("registerForm");
  const closeLogin = document.getElementById("closeLogin");
  const closeRegister = document.getElementById("closeRegister");
  const loginForm = loginFormModal.querySelector("form");
  const registerForm = registerFormModal.querySelector("form");
  const userSection = document.getElementById("userSection");
  const userNameSpan = document.getElementById("userName");
  const showFavoritesBtn = document.getElementById("showFavorites");

  loginBtn.addEventListener("click", () => {
    loginFormModal.classList.remove("hidden");
    registerFormModal.classList.add("hidden");
  });
  registerBtn.addEventListener("click", () => {
    registerFormModal.classList.remove("hidden");
    loginFormModal.classList.add("hidden");
  });
  closeLogin.addEventListener("click", () => loginFormModal.classList.add("hidden"));
  closeRegister.addEventListener("click", () => registerFormModal.classList.add("hidden"));

  /********** FIREBASE AUTH **********/
  const signUpUser = (name, email, password) => {
    auth.createUserWithEmailAndPassword(email, password)
      .then(async userCredential => {
        const user = userCredential.user;
        await db.collection("users").doc(user.uid).set({
          name, email, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        localStorage.setItem("userName", name);
        updateUIForAuth(user);
        registerFormModal.classList.add("hidden");
      })
      .catch(err => alert(err.message));
  };

  const signInUser = (email, password) => {
    auth.signInWithEmailAndPassword(email, password)
      .then(async userCredential => {
        const user = userCredential.user;
        const doc = await db.collection("users").doc(user.uid).get();
        const name = doc.exists ? doc.data().name : user.email;
        localStorage.setItem("userName", name);
        updateUIForAuth(user);
        loginFormModal.classList.add("hidden");
      })
      .catch(err => alert(err.message));
  };

  const signOutUser = () => {
    auth.signOut().then(() => {
      localStorage.clear();
      updateUIForAuth(null);
    });
  };

  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    signInUser(email, password);
  });

  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    signUpUser(name, email, password);
  });

  logoutBtn.addEventListener("click", signOutUser);

  function updateUIForAuth(user){
    if(user){
      const name = localStorage.getItem("userName") || user.email;
      userSection.classList.remove("hidden");
      userNameSpan.textContent = name;
      loginBtn.classList.add("hidden");
      registerBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      showFavoritesBtn.classList.remove("hidden");
      loadAPIQuakes();
    } else {
      userSection.classList.add("hidden");
      loginBtn.classList.remove("hidden");
      registerBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      showFavoritesBtn.classList.add("hidden");
      clearMarkers(mapAll);
    }
  }

  firebase.auth().onAuthStateChanged(user => {
    updateUIForAuth(user);
  });

  /********** LEAFLET MAPS **********/
  const mapAll = L.map('mapAll').setView([20,0], 2);
  const mapFiltered = L.map('mapFiltered').setView([20,0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapAll);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapFiltered);

  function getColor(mag){
    if(mag >= 7) return 'red';
    if(mag >= 5) return 'orange';
    if(mag >= 3) return 'yellow';
    return 'green';
  }

  let mapMarkers = [];
  function clearMarkers(map){
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];
  }

  /********** FAVORITOS **********/
  const showAPI = document.getElementById('showAPI');

  function createMarker(map, eq, isFavorite=false){
    const coords = [eq.geometry.coordinates[1], eq.geometry.coordinates[0]];
    const mag = eq.properties.mag;
    const title = eq.properties.title;
    const place = eq.properties.place;
    const code = eq.id;
    const date = new Date(eq.properties.time).toLocaleString();

    const marker = L.circleMarker(coords, {
      radius: mag*2,
      fillColor: getColor(mag),
      color:'#000',
      weight:1,
      opacity:1,
      fillOpacity:0.7
    }).addTo(map);

    let btnHTML = '';
    if(isFavorite){
      btnHTML = `<button class="removeFavBtn" data-id="${code}">Eliminar de favoritos</button>`;
    } else if(auth.currentUser){
      btnHTML = `<button class="addFavBtn" 
        data-id="${code}" 
        data-title="${title}" 
        data-place="${place}" 
        data-mag="${mag}" 
        data-lat="${coords[0]}" 
        data-lng="${coords[1]}" 
        data-time="${eq.properties.time}">Añadir a favoritos</button>`;
    }

    marker.bindPopup(`
      <b>${title}</b><br>
      Fecha: ${date}<br>
      Lugar: ${place}<br>
      Código: ${code}<br>
      Magnitud: ${mag}<br>
      ${btnHTML}
    `);

    mapMarkers.push(marker);
  }

  function loadAPIQuakes(){
    clearMarkers(mapAll);
    fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=50')
      .then(res => res.json())
      .then(data => data.features.forEach(eq => createMarker(mapAll, eq)));
  }

  function loadFavoriteQuakes(){
    if(!auth.currentUser) return;
    clearMarkers(mapAll);
    const userId = auth.currentUser.uid;
    db.collection('favorites').where('userId','==',userId).get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const eq = {
            geometry: { coordinates:[doc.data().coords[1], doc.data().coords[0]] },
            properties: {
              title: doc.data().title,
              place: doc.data().place,
              mag: doc.data().mag,
              time: doc.data().time
            },
            id: doc.data().quakeId
          };
          createMarker(mapAll, eq, true);
        });
      });
  }

  showAPI.addEventListener('click', loadAPIQuakes);
  showFavoritesBtn.addEventListener('click', loadFavoriteQuakes);

  mapAll.on('popupopen', function(e){
    const popupNode = e.popup.getElement();

    const addBtn = popupNode.querySelector('.addFavBtn');
    if(addBtn){
      addBtn.addEventListener('click', ()=>{
        if(!auth.currentUser) return alert('Debes iniciar sesión');
        const userId = auth.currentUser.uid;
        const quakeId = addBtn.dataset.id;
        const docRef = db.collection('favorites').doc(userId+'_'+quakeId);
        docRef.get().then(doc=>{
          if(!doc.exists){
            docRef.set({
              userId,
              quakeId,
              title: addBtn.dataset.title,
              place: addBtn.dataset.place,
              mag: parseFloat(addBtn.dataset.mag),
              coords: [parseFloat(addBtn.dataset.lat), parseFloat(addBtn.dataset.lng)],
              time: parseInt(addBtn.dataset.time)
            }).then(()=>alert('Añadido a favoritos!'));
          } else {
            alert('Este terremoto ya está en favoritos');
          }
        });
      });
    }

    const removeBtn = popupNode.querySelector('.removeFavBtn');
    if(removeBtn){
      removeBtn.addEventListener('click', ()=>{
        const userId = auth.currentUser.uid;
        const quakeId = removeBtn.dataset.id;
        db.collection('favorites').doc(userId+'_'+quakeId).delete()
          .then(()=>{alert('Eliminado de favoritos'); loadFavoriteQuakes();});
      });
    }
  });

  /********** MAPA FILTRADO **********/
  document.getElementById('applyFilter').addEventListener('click',()=>{
    const minMag = document.getElementById('minMag').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    let url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${minMag}&limit=50`;
    if(startDate) url+=`&starttime=${startDate}`;
    if(endDate) url+=`&endtime=${endDate}`;

    fetch(url).then(res=>res.json()).then(data=>{
      mapFiltered.eachLayer(l=>{if(l instanceof L.CircleMarker) mapFiltered.removeLayer(l)});
      data.features.forEach(eq=>createMarker(mapFiltered, eq));
    });
  });

});
