create database if not exists dashboard;

create table if not exists dashboard.deadlines (
  id int primary key auto_increment,
  title varchar(20),
  description varchar(100),
  dueDate datetime
) charset 'utf8mb4';

create table if not exists dashboard.units (
  id int primary key auto_increment,
  unitShortCode varchar(10),
  unitLongName varchar(100),
  unitColour varchar(7)
) charset 'utf8mb4';

create table if not exists dashboard.user (
  userId int primary key not null auto_increment,
  userFirstName varchar(50),
  userLastName varchar(50),
  userLastFMName varchar(50),
  userCity varchar(50),
  user24hrTime boolean DEFAULT 0,
  userDeadlineGrayScale boolean DEFAULT 0
) charset 'utf8mb4';

create table if not exists dashboard.apis (
  id int primary key auto_increment,
  apiName varchar(50),
  apiId varchar(50),
  fromNewsApi boolean default 0,
  activeApi boolean default 0,
  boxNo int default -1
) charset 'utf8mb4';

create table if not exists dashboard.layout (
  boxNo int primary key auto_increment,
  boxId varchar(50)
) charset 'utf8mb4';

create table if not exists dashboard.newsApis (
  id int primary key auto_increment,
  api varchar(50)
) charset 'utf8mb4';

insert ignore into dashboard.deadlines values (1, 'webscript', 'Dashboard Coursework', '2017-03-31 00:00:00');
insert ignore into dashboard.deadlines values (2, 'INSE', 'Final Report and Application', '2017-04-28 00:00:00');
insert ignore into dashboard.deadlines values (3, 'dummy', 'description', '2017-05-26 00:00:00');
insert ignore into dashboard.deadlines values (4, 'dummy', 'description', '2017-06-11 00:00:00');

insert ignore into dashboard.units values (1, 'webscript', 'Web-Script Programming', '#C6D4FF');
insert ignore into dashboard.units values (2, 'inse', 'Introduction to Software Engineering', '#F2C57C');
insert ignore into dashboard.units values (3, 'cosine', 'Computer Operating System And Intermediate Networking', '#869D7A');
insert ignore into dashboard.units values (4, 'mathfun', 'Discrete Mathematics and Functional Programming', '#EEEBD0');
insert ignore into dashboard.units values (5, 'dsalg', 'Data Structures and Algorithms', '#F06543');
insert ignore into dashboard.units values (6, 'adproc', 'Advanced Programming', '#ABE188');

insert ignore into dashboard.apis values (1, 'Four Four Two', 'four-four-two', 1, 0, -1);
insert ignore into dashboard.apis values (2, 'Current Weather', 'weather-div', 0, 0, -1);
insert ignore into dashboard.apis values (3, 'The Guardian UK', 'the-guardian-uk', 1, 0, -1);
insert ignore into dashboard.apis values (4, 'LastFM', 'last-fm-div', 0, 0, -1);
insert ignore into dashboard.apis values (5, 'BBC News', 'bbc-news', 1, 0, -1);
insert ignore into dashboard.apis values (6, 'Techcrunch', 'techcrunch', 1, 0, -1);
insert ignore into dashboard.apis values (7, 'BBC Sport', 'bbc-sport', 1, 0, -1);
insert ignore into dashboard.apis values (8, 'Google News', 'google-news', 1, 0, -1);
insert ignore into dashboard.apis values (9, 'Italian Football', 'football-italia', 1, 0, -1);
insert ignore into dashboard.apis values (10, 'Financial Times', 'financial-times', 1, 0, -1);
insert ignore into dashboard.apis values (11, 'The Washington Post', 'washington-post-div', 1, 0, -1);
insert ignore into dashboard.apis values (12, 'CNN', 'cnn', 1, 0, -1);
insert ignore into dashboard.apis values (13, 'Monzo Balance', 'monzo-balance-div', 0, 0, -1);
insert ignore into dashboard.apis values (14, 'Home-Work Travel Information', 'home-work-travel-div', 0, 0, -1);
insert ignore into dashboard.apis values (15, 'Work-Home Travel Information', 'work-home-travel-div', 0, 0, -1);

insert ignore into dashboard.layout values (1, '');
insert ignore into dashboard.layout values (2, '');
insert ignore into dashboard.layout values (3, '');
insert ignore into dashboard.layout values (4, '');
insert ignore into dashboard.layout values (5, '');
insert ignore into dashboard.layout values (6, '');
insert ignore into dashboard.layout values (7, '');
insert ignore into dashboard.layout values (8, '');

insert ignore into dashboard.newsApis values (1, 'bbc-news');
insert ignore into dashboard.newsApis values (2, 'bbc-sport');
insert ignore into dashboard.newsApis values (3, 'the-guardian-uk');
insert ignore into dashboard.newsApis values (4, 'four-four-two');
insert ignore into dashboard.newsApis values (5, 'techcrunch');
insert ignore into dashboard.newsApis values (6, 'google-news');
insert ignore into dashboard.newsApis values (7, 'football-italia');
insert ignore into dashboard.newsApis values (8, 'financial-times');
insert ignore into dashboard.newsApis values (9, 'the-washington-post');
insert ignore into dashboard.newsApis values (10, 'cnn');
