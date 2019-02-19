import Search from './module/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './module/Recipe';
import List from './module/List';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './module/Likes';

const state = {}

window.state = state;

const controlSearch = async () => {
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        state.search = new Search(query);

        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes)

        try {
            await state.search.getResults();
            clearLoader();
    
            searchView.renderResults(state.search.result);
        } catch(err) {
            alert('somthing wrog')
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

const controlRecipe = async () => {

    //get ID from URL
    const id = window.location.hash.replace('#', '');

    
    if(id) {
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        //create new recipe ob
        state.recipe = new Recipe(id);
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        //get recipe data
        try {
            //cal time servinsg
            state.recipe.calcTime();
            state.recipe.calcServings();
            //render
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));


        } catch(error) {
            alert('a error')
        }
    }
}


['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))

const controlList = () => {
    //create a new list if there is no yet
    if(!state.list) state.list = new List();

    //add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete event
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})
//restore like recipe on page load
window.addEventListener('load',() => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
})

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    if(!state.likes.isLiked(currentId)) {
        //add like to state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //toggle like button
        likesView.toggleLikeBtn(true);
        //add like to UI list
        likesView.renderLike(newLike);
        console.log(state.likes);
    } else {
        // remove like from state
        state.likes.deleteLike(currentId);
        //toggle like button
        likesView.toggleLikeBtn(false);
        //remove like from UI list
        likesView.deleteLike(currentId);
        console.log(state.likes);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}



elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe)

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //like controller
        controlLike();
    }
})

const l = new List();
window.l = l;