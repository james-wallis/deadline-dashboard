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
