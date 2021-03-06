import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS
} from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { delay, mergeMap, materialize, dematerialize } from "rxjs/operators";

// array in local storage for registered users
let users = JSON.parse(localStorage.getItem("users")) || [];
let movies = JSON.parse(localStorage.getItem("movieList")) || [];
let likes = JSON.parse(localStorage.getItem("likes")) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = request;

    // wrap in delayed observable to simulate server api call
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith("/users/register") && method === "POST":
          return register();
        case url.endsWith("/movies/store") && method === "POST":
          return storeMovies();
          case url.endsWith("/movies/like") && method === "POST":
          return likeMovies();
        case url.endsWith("/users/authenticate") && method === "POST":
          return authenticate();
        case url.endsWith("/movies") && method === "GET":
          return getMovies();
          case url.endsWith("/likes") && method === "GET":
            return getLikes();
        case url.endsWith("/users") && method === "GET":
          return getUsers();
        case url.match(/\/users\/\d+$/) && method === "GET":
          return getUserById();
        case url.match(/\/users\/\d+$/) && method === "DELETE":
          return deleteUser();
        case url.match(/\/movies\/\d+$/) && method === "DELETE":
          return deleteMovie();
        case url.match(/\/movies\/\d+$/) && method === "GET":
          return getMovieById();
        default:
          // pass through any requests not handled above
          return next.handle(request);
      }
    }

    // route functions
    function storeMovies() {
      const movie = body;
      movies.push(movie);
      localStorage.setItem("movieList", JSON.stringify(movies));
      return ok({ id: movie.id });
    }
    function likeMovies() {
      const like = body;
      likes.push(like);
      localStorage.setItem("likes", JSON.stringify(likes));
      return ok({ id: like.id });
    }
    function register() {
      const user = body;

      if (users.find(x => x.userName === user.userName)) {
        return error('Username "' + user.userName + '" is already taken');
      }

      user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));

      return ok();
    }

    function authenticate() {
      const { userName, password } = body;
      const user = users.find(
        x => x.userName === userName && x.password === password
      );
      if (!user) return error("Username or password is incorrect");

      return ok({
        id: user.id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        city: user.city,
        street: user.street,
        code: user.code,
        token: "jwt-token"
      });
    }

    function getMovies() {
      return ok(movies);
    }

    function getLikes() {
      return ok(likes);
    }

    function getUsers() {
      if (!isLoggedIn()) return unauthorized();
      return ok(users);
    }
    function getMovieById() {


      const movie = movies.find(x => x.id == idFromUrl());
      return ok(movie);
    }


    function getUserById() {
      if (!isLoggedIn()) return unauthorized();

      const user = users.find(x => x.id == idFromUrl());
      return ok(user);
    }

    function deleteUser() {
      if (!isLoggedIn()) return unauthorized();

      users = users.filter(x => x.id !== idFromUrl());
      localStorage.setItem("users", JSON.stringify(users));
      return ok();
    }
    function deleteMovie() {
      movies = movies.filter(x => x.id !== idFromUrl());
      localStorage.setItem("movieList", JSON.stringify(users));
      return ok();
    }
    // helper functions

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body }));
    }

    function unauthorized() {
      return throwError({ status: 401, error: { message: "Unauthorised" } });
    }

    function error(message) {
      return throwError({ error: { message } });
    }

    function isLoggedIn() {
      return (
        headers.get("Authorization") === "Bearer jwt-token" ||
        "Bearer jwt-token"
      );
    }

    function idFromUrl() {
      const urlParts = url.split("/");
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export const fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
