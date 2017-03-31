deadline-dashboard
======

The deadline-dashboard for my second year WebScript coursework.

Web Application Brief
----------------

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




Running the dashboard
----------------

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
  npm run forever
  ```

  This ensures that if you edit the code (or upload a new version), the server will restart.

5. Visit your website.
    * If you're on your VM you just need to put your VM's IP address into a browser, or if you're developing on a desktop machine it will be http://127.0.0.1:8080 .

Git: A recommendation
----------------------
If at all possible, we recommend you use git to download code rather than zips of a repository.  This is preferable because if the repo is updated, then syncing those changes requires just one command (`git pull`) and usually any merging can be done automatically.  Git is very powerful and we heartily encourages you to become familiar with it.
