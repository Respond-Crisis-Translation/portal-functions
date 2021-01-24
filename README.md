# portal-functions

### Installation
To get started, the first thing you need to do is to install the Firebase CLI, to do that, open your terminal and type:

```
npm install -g firebase-tools
```

Once installed, go ahead and use the CLI to log into your Firebase Console with:

```
firebase login
```

It will open a browser window for you to log in. 

And lastly, if not already initialized, move to the folder where you have your project and initialize Cloud Functions with:

```
firebase init functions
```

It will ask you a few things, like selecting if you want to use TypeScript or JavaScript, choosing the project it’s going to associate in your console, etc.

Choose TypeScript, and it will give you TSLint and will help you catch errors before they happen :)

### Deploy Function

#### Select Environment:

```
firebase use <app-id-in-.firebaserc>
```

For Dev:

```
firebase use rct-portal---dev
```

For Prod:

```
firebase use rct-portal
````

#### Set configurations:

```
firebase functions:config:set rct.email="<email>" rct.password="<password>"
```

#### Then Deploy Functions as:


```
firebase use <rct-portal---dev|rct-portal>
firebase deploy --only functions:fun-name,functions:addMessage,functions:makeUppercase
```