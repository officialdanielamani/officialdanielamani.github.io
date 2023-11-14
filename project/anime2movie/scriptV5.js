// JavaScript for dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle-checkbox');
const body = document.body;

// Check if dark mode is enabled in local storage
if (localStorage.getItem('dark-mode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Toggle dark mode on button click
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('dark-mode', 'disabled');
    }
});

const modal = document.getElementById('myModal');
const closeModalButton = document.getElementById('closeModal');

openModalButton.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeModalButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

function autoFormatInput() {
  const inputTextArea = document.getElementById('animeInput');
  const formattedInput = inputTextArea.value.split('\n').map(line => line.trim()).filter(line => line !== '').join(', ');
  inputTextArea.value = formattedInput;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkForMovies() {
  const animeList = document.getElementById('animeInput').value.split(',');
  const resultElement = document.getElementById('result');
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const progressLabel = document.getElementById('progress-label');

  progressContainer.style.display = 'block';

  const totalSeries = animeList.length;

  progressLabel.textContent = `0/${totalSeries}`;

  // Create the table if it doesn't exist
  if (!resultElement.querySelector('table')) {
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th style="text-align: center;">Series</th><th style="text-align: center;">Movie List</th></tr></thead><tbody></tbody>';
    resultElement.appendChild(table);
  }

  const tbody = resultElement.querySelector('tbody');
  for (let i = 0; i < totalSeries; i++) {
    const anime = animeList[i];
    const trimmedAnime = anime.trim();
    
    // Skip searching if input is blank or contains ",," or ", " or ends with ", "
    if (!trimmedAnime || /,,|, $/.test(trimmedAnime)) {
      continue;
    }
    
    const lowercasedAnime = trimmedAnime.toLowerCase();
    const jikanApiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(lowercasedAnime)}&type=movie`;
    let movies = [];

    // Find the existing series row if it exists
    let existingSeriesRow = null;
    const rows = tbody.querySelectorAll('tr');
    for (const row of rows) {
      const seriesCell = row.querySelector('td:first-child');
      if (seriesCell && seriesCell.textContent.trim() === trimmedAnime) {
        existingSeriesRow = row;
        break;
      }
    }

    let isChecked = true;

    if (existingSeriesRow) {
      // If the series exists, get the checkbox state
      const seriesCheckbox = existingSeriesRow.querySelector('.series-checkbox');
      isChecked = seriesCheckbox ? seriesCheckbox.checked : true;

      // Preserve existing movies if any
      const existingMoviesCell = existingSeriesRow.querySelector('td:last-child');
      if (existingMoviesCell) {
        movies.push(...Array.from(existingMoviesCell.querySelectorAll('input[type="checkbox"]')).map(checkbox => {
          return `${checkbox.checked ? '[X]' : '[ ]'} ${checkbox.nextSibling.textContent.trim()}`;
        }));
      }
    }

    try {
      const response = await fetch(jikanApiUrl);

      if (response.status === 200) {
        const data = await response.json();

        if (data && data.data && data.data.length > 0) {
          const relevantMovies = data.data.filter(entry =>
            (entry.title && entry.title.toLowerCase().includes(lowercasedAnime)) ||
            (entry.title_english && entry.title_english.toLowerCase().includes(lowercasedAnime)) ||
            (entry.title_japanese && entry.title_japanese.toLowerCase().includes(lowercasedAnime)) ||
            (entry.title_synonyms && entry.title_synonyms.some(synonym => synonym && synonym.toLowerCase().includes(lowercasedAnime)))
          );
          if (relevantMovies.length > 0) {
            for (const movie of relevantMovies) {
              const malUrl = movie.url;
              const movieTitle = movie.title;

              if (malUrl) {
                // Add a click event listener to the checkbox to prevent event propagation
                movies.push(`<a href="${malUrl}" target="_blank"><input type="checkbox" class="movie-checkbox" ${isChecked ? 'checked' : ''} onclick="event.stopPropagation()"> ${movieTitle}</a>`);
              } else {
                movies.push(`<input type="checkbox" class="movie-checkbox" ${isChecked ? 'checked' : ''}> ${movieTitle || ''}`);
              }
            }
          } else {
            // If no movies found, add a default entry with a checkbox
            movies.push(`<input type="checkbox" class="movie-checkbox" ${isChecked ? 'checked' : ''}>`);
          }
        } else {
          // If no movies found, add a default entry with a checkbox
          movies.push(`<input type="checkbox" class="movie-checkbox" ${isChecked ? 'checked' : ''}>`);
        }
      }
    } catch (error) {
      console.error(error);
    }

    // Add or update the series row
    if (existingSeriesRow) {
      existingSeriesRow.querySelector('td:last-child').innerHTML = movies.join('<br>');
    } else {
      // Create a new row if the series doesn't exist
      const newRow = document.createElement('tr');
      newRow.innerHTML = `<td><button onclick="deleteSeries(this)" id="del_btn">Delete</button> ${trimmedAnime} <input type="checkbox" class="series-checkbox" ${isChecked ? 'checked' : ''}></td><td>${movies.join('<br>')}</td>`;
      tbody.appendChild(newRow);
    }

    const completionPercentage = ((i + 1) / totalSeries) * 100;
    progressBar.style.width = `${completionPercentage}%`;
    progressLabel.textContent = `${i + 1}/${totalSeries}`;

    // Calculate a random sleep time between 1250 and 3000 milliseconds to ensure not limit rate API
    const randomSleepTime = Math.floor(Math.random() * (3000 - 1250 + 1)) + 1250;
    await sleep(randomSleepTime);
  }

  progressContainer.style.display = 'none';
}


// Function to delete a series row
function deleteSeries(button) {
  const row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
}

function clearTable() {
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = ''; // Clear the table content
}

function deleteBlankMovies() {
  const resultElement = document.getElementById('result');
  const rows = resultElement.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const movieCell = row.querySelector('td:last-child');
    if (movieCell) {
      const movieList = movieCell.innerText.trim();
      if (!movieList) {
        // Delete the row if the movie list is empty
        row.remove();
      }
    }
  });
}

function downloadJSON() {
  const resultElement = document.getElementById('result');
  const table = resultElement.querySelector('table');
  const rows = Array.from(table.querySelectorAll('tr'));
  const jsonData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 2) {
      const seriesCell = cells[0];
      const seriesName = seriesCell.innerText.replace('Delete', '').trim(); // Remove "Delete" from series name
      const seriesCheckbox = seriesCell.querySelector('.series-checkbox').checked;

      const movieCell = cells[1];
      const movieLinks = Array.from(movieCell.querySelectorAll('a')).map(a => {
        const title = a.innerText;
        const url = a.getAttribute('href');
        const checkbox = a.querySelector('.movie-checkbox') ? a.querySelector('.movie-checkbox').checked : true; // Check if the movie checkbox exists, otherwise default to true
        return {
          title,
          url,
          checkbox
        };
      });

      // If there are no movies, add a single blank movie with checkbox value true
      if (movieLinks.length === 0) {
        movieLinks.push({
          title: '',
          url: '',
          checkbox: true
        });
      }

      jsonData.push({
        name: seriesName,
        movies: movieLinks,
        checkbox: seriesCheckbox,
      });
    }
  });

  const jsonString = JSON.stringify(jsonData, null, 2);

  const blob = new Blob([jsonString], {
    type: 'application/json'
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'anime_movies.json';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

/* LEGACY VERSION

function importListFromJSON() {
  const importJSONInput = document.getElementById('importJSON');
  importJSONInput.click();
}

// Function to handle file input change
document.getElementById('importJSON').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          // Clear existing table content (bug as feauture, can merge multiple JSON)
          //clearTable();

          // Populate the animeInput field with series names
          const seriesList = data.map(item => item.name).join(', ');
          document.getElementById('animeInput').value = seriesList;

          // Populate the result table with series and movies
          const resultElement = document.getElementById('result');
          data.forEach(item => {
            const series = item.name;
            const seriesCheckbox = item.checkbox;
            const movies = item.movies.map(movie => {
              if (!movie.title) {
                movie.title = 'No Movie';
              }
              return `<a href="${movie.url}" target="_blank">${movie.title} <input type="checkbox" class="movie-checkbox" ${movie.checkbox ? 'checked' : ''}></a>`;
            }).join('<br> ');
            const row = document.createElement('tr');
            row.innerHTML = '<td><button onclick="deleteSeries(this)" id="del_btn">Delete</button> ' + series + ' <input type="checkbox" class="series-checkbox" ' + (seriesCheckbox ? 'checked' : '') + '</td><td>' + movies + '</td>';
            resultElement.querySelector('tbody').appendChild(row);
          });
        } else {
          alert('Invalid JSON format. Please provide an array of objects with "name" and "movies" properties.');
        }
      } catch (error) {
        alert('Error reading JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
});

*/


function importDetailFromJSON() {
  const importJSONInput = document.getElementById('importJSON');
  importJSONInput.click();
}

// Function to handle file input change for detailed import
document.getElementById('importJSON').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          // Clear existing table content
          clearTable();
          // Populate the animeInput field with series names
          const seriesList = data.map(item => item.name).join(', ');
          document.getElementById('animeInput').value = seriesList;

          // Populate the result table with series and movies from the JSON data
          const resultElement = document.getElementById('result');
          let table = '<table border="1" cellspacing="0" cellpadding="5"><thead><tr><th style="text-align: center;">Series</th><th style="text-align: center;">Movies List</th></tr></thead><tbody>';
          data.forEach(item => {
            const series = item.name;
            const seriesCheckbox = item.checkbox;
            const movies = item.movies.map(movie => {
              if (!movie.title) {
                movie.title = '';
              }
              // Add onclick to stop event propagation
               return `<a href="${movie.url}" target="_blank"><input type="checkbox" class="movie-checkbox" ${movie.checkbox ? 'checked' : ''} onclick="event.stopPropagation()"> ${movie.title}</a>`;
              }).join('<br> ');
            table += `<tr><td><button onclick="deleteSeries(this)" id="del_btn">Delete</button> ${series} <input type="checkbox" class="series-checkbox" ${seriesCheckbox ? 'checked' : ''}></td><td>${movies}</td></tr>`;
          });
          table += '</tbody></table>';
          resultElement.innerHTML = table;
        } else {
          alert('Invalid JSON format. Please provide an array of objects with "name," "checkbox," and "movies" properties.');
        }
      } catch (error) {
        alert('Error reading JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  }
});

function downloadMoviesList() {
  const downloadOption = document.getElementById('downloadOption').value;
  const resultElement = document.getElementById('result');
  const rows = Array.from(resultElement.querySelectorAll('tbody tr'));

  // Create an array to store the movies list based on the selected option
  const moviesList = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 2) {
      const movieCell = cells[1];
      const movieLinks = Array.from(movieCell.querySelectorAll('a'));

      const selectedMovies = movieLinks.filter(a => a.querySelector('.movie-checkbox').checked);
      const unselectedMovies = movieLinks.filter(a => !a.querySelector('.movie-checkbox').checked);

      if (downloadOption === 'all') {
        const movieTitles = movieLinks.map(a => a.innerText.trim()).filter(title => title !== '').join(',\n');
        if (movieTitles.trim() !== '') {
          moviesList.push(movieTitles);
        }
      } else if (downloadOption === 'selected' && selectedMovies.length > 0) {
        const movieTitles = selectedMovies.map(a => a.innerText.trim()).filter(title => title !== '').join(',\n');
        if (movieTitles.trim() !== '') {
          moviesList.push(movieTitles);
        }
      } else if (downloadOption === 'unselected' && unselectedMovies.length > 0) {
        const movieTitles = unselectedMovies.map(a => a.innerText.trim()).filter(title => title !== '').join(',\n');
        if (movieTitles.trim() !== '') {
          moviesList.push(movieTitles);
        }
      }
    }
  });

  // Join movie titles with a line break and place each on a new line
  const formattedMoviesList = moviesList.join(',\n');

  // Create a text file with the formatted movies list
  const blob = new Blob([formattedMoviesList], {
    type: 'text/plain'
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'movies_list.txt';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}


function downloadSeriesList() {
  const downloadSeriesOption = document.getElementById('downloadSeriesOption').value;
  const resultElement = document.getElementById('result');
  const rows = Array.from(resultElement.querySelectorAll('tbody tr'));

  // Create an array to store the series list based on the selected option
  const seriesList = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 2) {
      const seriesCell = cells[0];
      const seriesCheckbox = seriesCell.querySelector('.series-checkbox');
      const seriesName = seriesCell.innerText.replace('Delete', '').trim();

      if (
        downloadSeriesOption === 'all' ||
        (downloadSeriesOption === 'selected' && seriesCheckbox.checked) ||
        (downloadSeriesOption === 'unselected' && !seriesCheckbox.checked)
      ) {
        seriesList.push(seriesName);
      }
    }
  });

  // Join series names with a comma and place each on a new line
  const formattedSeriesList = seriesList.join(',\n');

  // Create a text file with the formatted series list
  const blob = new Blob([formattedSeriesList], {
    type: 'text/plain'
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'series_list.txt';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}