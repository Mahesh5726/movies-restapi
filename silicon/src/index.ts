import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono();

type Movie = {
  "id": string,
  "title": string,
  "director": string,
  "releaseYear": number,
  "genre": string,
  "rating"?: number[]
}

const movies: Movie[] = [];


//first
app.post('/movies', async (context) => {
  try{
      const body = await context.req.json();
      const {id, title, director, releaseYear, genre} = body;
      const newMovie: Movie = {
        id: body.id,
        title: body.title,
        director: body.director,
        releaseYear: body.releaseYear,
        genre: body.genre
      }
      
      if(!id || !title || !director || !releaseYear || !genre){
        return context.json({message: "Missing Required Fields"}, 400);
      }

      if(movies.some(r => r.id === body.id)){
        return context.json({message: "400 Bad Request: Duplicate ID."}, 400);
      }

      movies.push(newMovie);
      return context.json({ message: 'Movie added successfully', movie: body }, 201);
  }
  catch {
    return context.json({ message: "400 Bad Request, Invalid JSON format." }, 400);
  }
})


//seven
app.get('/movies/top-rated', (context) => {
  if (movies.length === 0) {
    return context.json({ message: "404 Not Found: No movies found." }, 404);
  }

  const sortedMovies = movies.sort((a, b) => {
    let totalA = 0, totalB = 0;

        a.rating!.forEach(totalRating => totalA += totalRating);
        b.rating!.forEach(totalRating => totalB += totalRating);

        const avgA = totalA / a.rating!.length;
        const avgB = totalB / b.rating!.length;

        return avgB - avgA;
  });
  return context.json({movies: sortedMovies.slice(0, 5)}, 200);
})


//second
app.patch('/movies/:id', async(context) => {
  try {
    const id = context.req.param("id");
    const body = await context.req.json();
    const movie = movies.find((m) => m.id === id);

    if (!movie) {
      return context.json({ message: "404 Not Found: Movie not found." }, 404);
    }

    const updatedMovie = { ...movie, ...body };

    if (
      (body.title && typeof body.title !== "string") ||
      (body.director && typeof body.director !== "string") ||
      (body.releaseYear && typeof body.releaseYear !== "number") ||
      (body.genre && typeof body.genre !== "string")
    ) {
      return context.json({ message: "400 Bad Request: Invalid fields provided." }, 400);
    }

    Object.assign(movie, updatedMovie);

    return context.json({ message: "Movie updated", movie }, 200);
  } catch {
    return context.json({ message: "400 Bad Request: Invalid JSON format." }, 400);
  }
})



//third
app.get('movies/:id', (context) => {
  const id = context.req.param("id");
  const movie = movies.find((m) => m.id === id);
  
  if (movie) {
    return context.json({ movie }, 200);
  } 
  else {
    return context.json({ message: "404 Not Found: Movie not found." }, 404);
  }
})


//four
app.delete('/movies/:id', (context) => {
  const id = context.req.param("id");
  const movieIndex = movies.findIndex((m) => m.id === id);

  if (movieIndex === -1) {
    return context.json({ message: "404 Not Found: Movie not found." }, 404);
  }

  movies.splice(movieIndex, 1);
  return context.json({ message: "Movie deleted successfully" }, 200);
});


//five
app.post('/movies/:id/rating', async (context) => {
  try {
    const id = context.req.param("id");
    const body = await context.req.json();
    const movie = movies.find((m) => m.id === id);

    if (!movie) {
      return context.json({ message: "404 Not Found: Movie not found." }, 404);
    }

    const { rating } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return context.json({ message: "400 Bad Request: Rating must be a number between 1 and 5." }, 400);
    }

    if (!movie.rating) {
      movie.rating = [];
    }
    movie.rating.push(rating);
    return context.json({ message: "Movie rated successfully", movie }, 200);
  } catch {
    return context.json({ message: "400 Bad Request: Invalid JSON format." }, 400);
  }
})



//six
app.get('/movies/:id/rating', (context) => {
  const id = context.req.param("id");
  const movie = movies.find((m) => m.id === id);
  
  if (!movie) {
    return context.json({ message: "404 Not Found: Movie not found." }, 404);
  }

  if (!movie.rating || movie.rating.length === 0) {
    return context.json({message: "204 No Content: This movie has no ratings."}, 204);
  }

  const averageRating = movie.rating.reduce((acc, curr) => acc + curr, 0) / movie.rating.length;
  return context.json({movie, averageRating}, 200);
})


//eight
app.get('/movies/genre/:genre', (context) => {
  const genre = context.req.param("genre");
  const filteredMovies = movies.filter((movie) => movie.genre.toLowerCase() === genre.toLowerCase());
  
  if (filteredMovies.length === 0) {
    return context.json({ message: "404 Not Found: No movies found for the specified genre." }, 404);
  }
  
  return context.json({ movies: filteredMovies }, 200);
});


//nine
app.get('/movies/director/:director', (context) => {
  const director = context.req.param("director");
  const filteredMovies = movies.filter((movie) => movie.director.toLowerCase() === director.toLowerCase());
  
  if (filteredMovies.length === 0) {
    return context.json({ message: "404 Not Found: No movies found by the specified director." }, 404);
  }
  
  return context.json({ movies: filteredMovies }, 200);
});


//ten
app.get('/movies/search/:keyword', (context) => {
  const keyword = context.req.param("keyword");
  const filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword.toLowerCase()));
  
  if (filteredMovies.length === 0) {
    return context.json({ message: "404 Not Found: No movies match the search keyword." }, 404);
  }
  
  return context.json({ movies: filteredMovies }, 200);
});



serve(app);