# deadline-dashboard


The deadline-dashboard for my second year WebScript coursework.

## Web Application Brief


Your challenge is to create a Configurable Dashboard.

You are to specify and construct this configurable dashboard using a combination of HTML, CSS, JavaScript and (optionally) PHP, and any backing store you desire (e.g. a database).

Example use cases include:
in the home (perhaps for helping a family see what the weather will be like, their upcoming schedule, the latest tweets from their friends, etc.), updated at appropriate intervals.
in an office (such as the BK first floor, where we have a flat panel for displaying information to staff and visitors).  A combination of live data from the web and various databases, stories from various sources, images and video may all need to be displayed.

Configuration of your dashboard may be achieved by editing config files, or through a Dashboard Editor created as part of your deliverable artifact – this is your choice.

Your task is to show (through your work) the extent to which you have met the learning outcomes for the unit.

The learning outcomes (as defined in the Unit Spec.) are:
Identify industry best practices in web application design (e.g. client, server and API layers).
Design a contemporary web application using industry best practices.
Critically evaluate the design and implementation of web applications.




## Running the dashboard


To get the dashboard running, you must install the source code and all modules and then run the server from the command line:

1. To download the code, use git (the simplest option):

  ```bash
  git clone https://github.com/jamesemwallis/deadline-dashboard.git
  cd deadline-dashboard
  ```

2. To download any libraries the code uses, type:

  ```bash
  npm install
  ```

3. Install and run MySQL.
    * If you're using your VM for this, MySQL is already installed and running.

4. Edit `sql_config.json` so that your database `host`, `user` and `password` properties are correct.
    * The defaults may not work on your VM, as this project is mostly run from a different server.

5. Install the database and tables using: `npm run initsql`
    * If your `host` and `user` differ from the defaults, you may need to update `package.json` for the `initsql` script to work.

6. Start the server by typing:

  ```bash
  npm run dashboard
  ```

  This ensures that if you edit the code (or upload a new version), the server will restart.

5. Visit your website.
    * If you're on your VM you just need to put your VM's IP address into a browser, or if you're developing on a desktop machine it will be http://127.0.0.1:8080.

### Use of Last FM


The Dashboard takes in a users lastfm username so it is ideal if you create one before you start the dashboard for the first time.
There is currently no way to change the lastfm username once the user has been created (but this feature will be added once the coursework has been submitted. Reason for lack of function: Ran out of time.)

Through using last fm you can display your currently playing song on last fm, but also last fm can be added to spotify in order to display your spotify currently playing.

[Last FM create account](https://www.last.fm/join)

[Add Spotify to Last FM](https://support.spotify.com/us/using_spotify/playlists/scrobble-to-last-fm/)

## About the Dashboard


The Dashboard is _currently_ designed for one user and one user only. Adding more than one user to the database will not change anything in the dashboard.
It has been designed for personal use outside of its coursework origins. I intend to use it as either a new tab page for chrome or a dashboard in my bedroom.
Its major purpose is to tell me my upcoming deadlines and also to keep me updated with the news, displaying the weather and telling me what my spotify is playing.

### Coursework Reflection

#### Functionality

> How appropriate is the design?  Does it all work?  How much does it do?  How much is your own work as opposed to libraries?

Firstly, the design. I think the design complements its features. While sometimes there are scaling issues on smaller screens, on larger ones, for which it is designed, it looks clear and easy to read. It was designed to sit in the background of a room, not attracting attention so that it would not be a distraction, however the coloured deadlines make them stand out on the page.

It mostly all works, there are features such as grey scaling the deadlines on the deadline page which did not get implemented aswell as making the clock 24hrs as an option. However everything else that has been created works as it should.

It does _a lot_.

The Dashboard is able to show different api's (the news ones are especially easy to add), such as news, last fm, quotes and the weather.
It is customisable as the user can choose which api's to see in which box.
Additionally, the user is able to add deadlines and course units in order to view the deadlines that are up and coming.
For the news boxes I use [News API](https://newsapi.org/) to get the current news. This allows me to easily add new id's for the content whilst using the same styling for each news box.

Most of the dashboard is my own work, but I use the library [Sweet Alert](http://t4t5.github.io/sweetalert/) in order to do form confirms.

_Areas for improvement_

* If I had more time, I would add more api's to select and add to the dashboard. The main issue with this at the moment is that unless it comes from newsAPI the custom styling for each different api is custom to it.
* The functionality to change a user profile after it has been created.
* The ability to see passed deadlines as well as mark them as completed.
* Functionality to display when there is less than a week until a deadline.

##### Maintainability

> Code style, comprehensibility and maintainability. This includes formatting, file structure, naming - everything that can help your work live on and be useful after it is graded, including how well the code and any documentation communicates any concepts necessary to understand the architecture and configuration of the system.

All code is formatted in a readable manner, with each function having a comment instructing the user/developer what it does.
To this end I believe that the code is clear, yet I know it could be improved as there are functions that could be created to stop duplication of code.
Each function is named in such a way that it attempts to portray clearly what it does without comments.
Huge downside of the dashboard is the file structure. Apart from the server.js file, all javascript, html and css files are in the same folder when they should be split into seperate ones. This became apparent very close to the deadline for the coursework and I decided that I wouldn't take the risk that changing the locations of the file would break the dashboard.

_Areas for improvement_

* Code duplication needs to be reduced.
* Comments could be made better and more informative in places
* File structure needs a revamp

#### Usability

> Ease-of-use of your system, including the use of event-driven input, background refresh, drag and drop, intuitive UI design, etc.

The system is easy to use. The main difficulty with it is finding the settings menu button. This is because I have intentionally hidden it so that it is not easy to see when the dashboard is being displayed (with no user input) for long periods of time.
I created an introduction page which runs after the user account has been created which contains a .gif and description of where the menu bar is located.
There is a lot of background-refresh which takes place to refresh the news boxes and the lastfm one particularily (the lastfm refresh takes place every second so that it updates when the song changes).
I have not used drag and drop and in hindsight think that this is the right decision as I believe it would distract from the purpose of the dashboard and overcomplicate it.

_Areas for improvement_

* UI could have some improvement to make things clearer such as font scaling for different sizes screens.
* Feedback could be taken from different users to get ideas on different menu buttons or whether the current, hidden button is fine for the dashboard.
