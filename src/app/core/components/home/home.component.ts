import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MoviesService } from "../../services/movies.service";
import { shuffle, moviesArray } from "../../../shared/globals";
import { Movie } from "../../../shared/models/movie";
import { Subscription } from "rxjs";
import { Fader } from 'src/app/shared/animations';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  animations:[Fader.animations]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  movies: any;
  movieForm: FormGroup;
  storedMovies: any[] = [];
  spinner: boolean;
  repeatedMovie: any;
  subscription: Subscription;
  notfound: string;
  error: boolean;
  topMovie$: any;
  movieRate: number;
  @ViewChild('movie', {static: false})
  userNameRef:ElementRef
  constructor(private movieService: MoviesService, private fb: FormBuilder) {}

  ngOnInit() {
    this.movieForm = this.fb.group({
      name: ["", Validators.required]
    });
    this.getTop("Belle de Jour");
    //Get movies from backend
    this.movieService.getStoredMovies().subscribe(data => {
      this.storedMovies = data;
      this.duplicatedMovies();
    });
  }
  ngAfterViewInit(){
    setTimeout(()=>{
      this.userNameRef.nativeElement.focus();
    },1000)

  }
  convert(string: string) {
    let number = parseFloat(string);
    return number;
  }

  get name() {
    return this.movieForm.get("name");
  }

  //Method to display the top 10 movies and also to display default movie on page load
  getTop(movie) {
    this.subscription = this.movieService
      .getMovies(movie)
      .subscribe(dataList => {
        this.movies = Array.of(dataList[0]);
      });
  }

  duplicatedMovies() {
    //find duplicated entries and
    let findDuplicates = arr =>
      arr.filter((item, index) => arr.indexOf(item) != index);
    let repeated: any = findDuplicates(this.storedMovies);
    //create a new array with unique values
    this.repeatedMovie = [...new Set(repeated)];
    //shuffle para o top 5 variar
    shuffle(this.repeatedMovie);
    var counts = {};
    repeated.forEach(function(x) {
      counts[x] = (counts[x] || 0) + 1;
    });
  }

  //insert movie into backend array
  insertMovie(movie: any) {
    this.subscription = this.movieService
      .storeMovies(movie)
      .subscribe(() => {});
  }

  getMovie() {
    this.spinner = true;
    //API CALL NAO ESQUECER PASSAR OS FILMES PARA O DETAIL
    (this.subscription = this.movieService
      .getMovies(this.name.value)
      .subscribe((dataList: Movie) => {
        this.movies = Array.of(dataList[0]);
        this.spinner = false;

        let error: any = this.movies.map(error => error.Error);

        if (error[0]) {
          this.notfound = error[0];
          this.error = true;
        } else {
          this.error = false;
          this.movieRate = this.movies.map(rating => rating.imdbRating.toString());
          console.log(this.movieRate)

        }
      })),
      error => console.log(error);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
