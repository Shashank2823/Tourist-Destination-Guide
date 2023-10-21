let navbarDiv = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if(document.body.scrollTop > 40 || document.documentElement.scrollTop > 40){
        navbarDiv.classList.add('navbar-cng');
    } else {
        navbarDiv.classList.remove('navbar-cng');
    }
});


const navbarCollapseDiv = document.getElementById('navbar-collapse');
const navbarShowBtn = document.getElementById('navbar-show-btn');
const navbarCloseBtn = document.getElementById('navbar-close-btn');
// show navbar
navbarShowBtn.addEventListener('click', () => {
    navbarCollapseDiv.classList.add('navbar-collapse-rmw');
});

// hide side bar
navbarCloseBtn.addEventListener('click', () => {
    navbarCollapseDiv.classList.remove('navbar-collapse-rmw');
});


let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove("resize-animation-stopper");
    }, 400);
});

//API ----------------------------------------------------------------------------------------

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('destination-input');

let Gid;
let contentId;

function attachButtonClickListeners() {
  document.querySelectorAll('.block').forEach(button => {
    button.addEventListener('click', () => {
      contentId = button.getAttribute('data-content-id');
      console.log(contentId);

      const resultContainer = document.getElementById('result-container');

      const loading = document.createElement('div');
      loading.classList.add('loading');
      loading.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      resultContainer.innerHTML="";
      resultContainer.appendChild(loading);

      fetch('https://travel-advisor.p.rapidapi.com/attractions/v2/get-details?currency=USD&units=km&lang=en_US',{
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': '47b35680cemshea1dc5c183cbd04p17951cjsn8e0a5324a598',
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
        },
        body: JSON.stringify({
          contentId: contentId,
          startDate: '2023-06-30',
          endDate: '2023-07-01',
          pax: [
            {
              ageBand: 'ADULT',
              count: 2
            }
          ]
        })
      })
      .then(response=>response.json())
      .then(response => {
        
        console.log(contentId);
        console.log(response);
        resultContainer.removeChild(loading);
        
        let currentIndex = 0;

        function showImage() {
          const data = response.data.AppPresentation_queryAppDetailV2[0];
          const name = data.container.navTitle;
          const url = data.sections[0].heroContent[currentIndex].data.sizes[5].url;
        
          const nameElem = document.createElement('h2');
          nameElem.classList.add('image-name');
          nameElem.innerText = name;
        
          const img = document.createElement('img');
          img.src = url;
        
          const prevBtn = document.createElement('button');
          prevBtn.classList.add('pre');
          prevBtn.innerHTML = '<span><</span>';
          prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + data.sections[0].heroContent.length) % data.sections[0].heroContent.length;
            img.src = data.sections[0].heroContent[currentIndex].data.sizes[5].url;
          });
        
          const nextBtn = document.createElement('button');
          nextBtn.classList.add('nex');
          nextBtn.innerHTML = '<span>></span>';
          nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % data.sections[0].heroContent.length;
            img.src = data.sections[0].heroContent[currentIndex].data.sizes[5].url;
          });
        
          const backButton = document.createElement('button');
          backButton.id = 'back-btn';
          backButton.innerHTML = '<span>Back</span>';
          backButton.addEventListener('click', (event) => {
            event.preventDefault();
            const query = searchInput.value.trim();
            getLocationId(query)
              .then(Gid => getAttractionsList(Gid))
              .then(() => attachButtonClickListeners())
              .catch(err => console.log(err));
          });
        
          const buttonContainer = document.createElement('div');
          buttonContainer.classList.add('button-container');
          buttonContainer.appendChild(prevBtn);
          buttonContainer.appendChild(nextBtn);
          
          const imageContainer = document.createElement('div');
          imageContainer.classList.add('image-container');
          imageContainer.appendChild(nameElem);
          imageContainer.appendChild(img);
        
          const container = document.createElement('div');
          container.classList.add('container');
          container.appendChild(imageContainer);
          container.appendChild(buttonContainer);
         container.appendChild(backButton);
        
        
          resultContainer.innerHTML = '';
          resultContainer.appendChild(container);
        }
        
        
showImage();
      })     
      .catch(err=>{
        console.log(err);
        resultContainer.innerHTML = 'No more images';
      });
    });
  });
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  getLocationId(query)
  
    .then(Gid => getAttractionsList(Gid))
    .then(() => attachButtonClickListeners())
    .catch(err => console.log(err));
});

function getLocationId(query) {
  return fetch(`https://travel-advisor.p.rapidapi.com/locations/v2/auto-complete?query=${query}&lang=en_US&units=km`, {
    method: 'GET',
    headers: {
      'content-type': 'application/JSON',
      'X-RapidAPI-Key': '47b35680cemshea1dc5c183cbd04p17951cjsn8e0a5324a598',
      'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
    }
  })
  .then(response => response.json())
  .then(response => {
    const x = response.data.Typeahead_autocomplete.results;
    const result = x.find(item => item.hasOwnProperty('detailsV2'));
    const Gid = result ? result.detailsV2.route.typedParams.geoId : null;
    console.log(Gid);
    return Gid;
  })
  .catch(err => {
    console.log(err);
    resultContainer.innerHTML = 'Location not found';
  });
}

function getAttractionsList(Gid) {
  const resultContainer = document.getElementById('result-container');
  

  const spinner = document.createElement('div');
  spinner.classList.add('spinner');

  resultContainer.innerHTML = '';
  resultContainer.appendChild(spinner);

  return fetch('https://travel-advisor.p.rapidapi.com/attractions/v2/list?currency=USD&units=km&lang=en_US', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '47b35680cemshea1dc5c183cbd04p17951cjsn8e0a5324a598',
      'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
    },
    body: JSON.stringify({
      geoId: Gid
    })
  })
    .then(response => response.json())
    .then(response => {
      const y = response.data.AppPresentation_queryAppListV2[0].sections;
      const buttons = [];
      for (let i = 1; i <= y.length && buttons.length < y.length/2-1 && buttons.length<=10; i += 2) {
        const section = y[i];
        if (section.hasOwnProperty('listSingleCardContent')) {
          const cardTitle = section.listSingleCardContent.cardTitle.string;
          contentId = section.listSingleCardContent.saveId.id;
          buttons.push({title: cardTitle, contentId: contentId});
        }
      }
      if (buttons.length === 0) {
        const z=y[2].content;
        for (let i = 0; i <= 3 && buttons.length < z.length; i += 1) {
          const section = y[2];
          if (section.hasOwnProperty('content')) {
            const cardTitle = section.content[i].cardTitle.string;
            contentId = section.content[i].saveId.id;
            buttons.push({title: cardTitle, contentId: contentId});
          }
        }
      }

      resultContainer.innerHTML = buttons.map(button => `<button class="block" data-content-id="${button.contentId}">${button.title}</button>`).join('');
     
    })
    .catch(err => {
      console.log(err);
      resultContainer.innerHTML = 'Location not found';
    });
}



attachButtonClickListeners();




