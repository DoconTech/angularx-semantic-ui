# Rating Usage
<a href="https://github.com/lon-yang/angularx-semantic-ui/blob/master/src/rating/README_CN.md">简体中文</a>

```typesctript
  import { RATING_DIRECTIVES } from 'angularx-semantic-ui'
```
```html
  <lsu-rating [(ngModel)]="rating" [maxRating]="'10'" [type]="'heart'" [size]="'huge'"></lsu-rating>
```

# Options
- rating:  Required. Current rating
- maxRating:  Required. Maximum rating
- type:  Optional. Rating icon type ` [ heart | star(default)] `
- size:  Optional. ` [ mini | tiny | small | normal(default) | large | huge | massive ] `
