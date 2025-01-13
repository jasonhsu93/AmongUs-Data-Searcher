-- Dropping Existing Tables
BEGIN
    FOR rec IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE ' || rec.table_name || ' CASCADE CONSTRAINTS';
    END LOOP;
END;
/

-- Creating Tables

-- 1. Player Table
CREATE TABLE Player (
    Color VARCHAR2(20) PRIMARY KEY,
    PlayerName VARCHAR2(30) NOT NULL UNIQUE, 
    Role VARCHAR2(10) NOT NULL CHECK (Role IN ('Crewmate', 'Impostor'))
);

-- 2. Map Table
CREATE TABLE Map (
    MapID NUMBER PRIMARY KEY,
    MapName VARCHAR2(50) NOT NULL CHECK (MapName IN ('The Skeld', 'MIRA HQ', 'Polus', 'TheFungle', 'Airship')),
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP NOT NULL
);

-- 3. Room Table
CREATE TABLE Room (
    RoomName VARCHAR2(50) PRIMARY KEY,
    MapID NUMBER NOT NULL,
    FOREIGN KEY (MapID) REFERENCES Map(MapID) ON DELETE CASCADE
);

-- 4. TaskInfo Table
CREATE TABLE TaskInfo (
    TaskName VARCHAR2(50) PRIMARY KEY,
    Length VARCHAR2(10) NOT NULL CHECK (Length IN ('Short', 'Long')),
    NumRequired NUMBER NOT NULL
);

-- 5. Task Table
CREATE TABLE Task (
    TaskID NUMBER PRIMARY KEY,
    TaskName VARCHAR2(50) NOT NULL,
    RoomName VARCHAR2(50) NOT NULL,
    Complete CHAR(1) NOT NULL CHECK (Complete IN ('T', 'F')),
    FOREIGN KEY (TaskName) REFERENCES TaskInfo(TaskName) ON DELETE CASCADE,
    FOREIGN KEY (RoomName) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 6. SabotageTypeInfo Table
CREATE TABLE SabotageTypeInfo (
    SabotageType VARCHAR2(30) PRIMARY KEY,
    Length VARCHAR2(10) NOT NULL CHECK (Length IN ('Short', 'Long')),
    Cooldown NUMBER NOT NULL
);

-- 7. Sabotage Table
CREATE TABLE Sabotage (
    SabotageID NUMBER PRIMARY KEY,
    SabotageType VARCHAR2(30) NOT NULL,
    RoomName VARCHAR2(50) NOT NULL,
    FOREIGN KEY (SabotageType) REFERENCES SabotageTypeInfo(SabotageType) ON DELETE CASCADE,
    FOREIGN KEY (RoomName) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 8. EmergencyMeeting Table
CREATE TABLE EmergencyMeeting (
    MeetingTime TIMESTAMP PRIMARY KEY,
    CallerColor VARCHAR2(20) NOT NULL,
    DiscussionDuration NUMBER NOT NULL,
    FOREIGN KEY (CallerColor) REFERENCES Player(Color) ON DELETE CASCADE
);

-- 9. Chat Table
CREATE TABLE Chat (
    ChatID NUMBER PRIMARY KEY,
    Message CLOB NOT NULL,
    Timestamp TIMESTAMP NOT NULL,
    Color VARCHAR2(20) NOT NULL,
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE
);

-- 10. Kills Table
CREATE TABLE Kills (
    ImpostorColor VARCHAR2(20) NOT NULL,
    CrewmateColor VARCHAR2(20) NOT NULL,
    TimeOfKill TIMESTAMP NOT NULL,
    RoomName VARCHAR2(50) NOT NULL,
    PRIMARY KEY (ImpostorColor, CrewmateColor, TimeOfKill),
    FOREIGN KEY (ImpostorColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (CrewmateColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (RoomName) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 11. Votes Table
CREATE TABLE Votes (
    VoterColor VARCHAR2(20) NOT NULL,
    VotedColor VARCHAR2(20) NOT NULL,
    MeetingTime TIMESTAMP NOT NULL,
    PRIMARY KEY (VoterColor, VotedColor, MeetingTime),
    FOREIGN KEY (VoterColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (VotedColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (MeetingTime) REFERENCES EmergencyMeeting(MeetingTime) ON DELETE CASCADE
);

-- 12. Vent Table
CREATE TABLE Vent (
    Color VARCHAR2(20) NOT NULL,
    RoomName1 VARCHAR2(50) NOT NULL,
    RoomName2 VARCHAR2(50) NOT NULL,
    PRIMARY KEY (RoomName1, RoomName2),
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (RoomName1) REFERENCES Room(RoomName) ON DELETE CASCADE,
    FOREIGN KEY (RoomName2) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 13. PlaysIn Table
CREATE TABLE PlaysIn (
    Color VARCHAR2(20) NOT NULL,
    MapID NUMBER NOT NULL,
    PRIMARY KEY (Color, MapID),
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (MapID) REFERENCES Map(MapID) ON DELETE CASCADE
);

-- 14. Performs Table
CREATE TABLE Performs (
    Color VARCHAR2(20) NOT NULL,
    TaskID NUMBER NOT NULL,
    PRIMARY KEY (Color, TaskID),
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (TaskID) REFERENCES Task(TaskID) ON DELETE CASCADE
);

-- 15. OccursIn Table
CREATE TABLE OccursIn (
    TaskID NUMBER NOT NULL,
    RoomName VARCHAR2(50) NOT NULL,
    PRIMARY KEY (TaskID, RoomName),
    FOREIGN KEY (TaskID) REFERENCES Task(TaskID) ON DELETE CASCADE,
    FOREIGN KEY (RoomName) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 16. MessagesIn Table
CREATE TABLE MessagesIn (
    Color VARCHAR2(20) NOT NULL,
    ChatID NUMBER NOT NULL,
    PRIMARY KEY (Color, ChatID),
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (ChatID) REFERENCES Chat(ChatID) ON DELETE CASCADE
);

-- 17. Calls Table
CREATE TABLE Calls (
    MeetingTime TIMESTAMP NOT NULL,
    Color VARCHAR2(20) NOT NULL,
    PRIMARY KEY (MeetingTime, Color),
    FOREIGN KEY (MeetingTime) REFERENCES EmergencyMeeting(MeetingTime) ON DELETE CASCADE,
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE
);

-- 18. HappensIn Table
CREATE TABLE HappensIn (
    KillerColor VARCHAR2(20) NOT NULL,
    VictimColor VARCHAR2(20) NOT NULL,
    RoomName VARCHAR2(50) NOT NULL,
    PRIMARY KEY (KillerColor, VictimColor, RoomName),
    FOREIGN KEY (KillerColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (VictimColor) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (RoomName) REFERENCES Room(RoomName) ON DELETE CASCADE
);

-- 19. TakesPlaceIn Table
CREATE TABLE TakesPlaceIn (
    Color1 VARCHAR2(20) NOT NULL,
    Color2 VARCHAR2(20) NOT NULL,
    MeetingTime TIMESTAMP NOT NULL,
    PRIMARY KEY (Color1, Color2, MeetingTime),
    FOREIGN KEY (Color1) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (Color2) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (MeetingTime) REFERENCES EmergencyMeeting(MeetingTime) ON DELETE CASCADE
);

-- 20. Vented Table
CREATE TABLE Vented (
    Color VARCHAR2(20) NOT NULL,
    RoomName1 VARCHAR2(50) NOT NULL,
    RoomName2 VARCHAR2(50) NOT NULL,
    PRIMARY KEY (Color, RoomName1, RoomName2),
    FOREIGN KEY (Color) REFERENCES Player(Color) ON DELETE CASCADE,
    FOREIGN KEY (RoomName1) REFERENCES Room(RoomName) ON DELETE CASCADE,
    FOREIGN KEY (RoomName2) REFERENCES Room(RoomName) ON DELETE CASCADE
);

--INSERTS
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Red', 'Those', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Blue', 'Who', 'Impostor');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Green', 'fn', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Yellow', 'Winter Arc', 'Impostor');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Pink', 'Christopher', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Purple', 'Jason', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Brown', 'Troy', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Orange', 'worldoftshirts', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('White', 'mangos mangos mangos phonk', 'Crewmate');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Black', 'Know', 'Impostor');
INSERT INTO Player (Color, PlayerName, Role) VALUES ('Cyan', 'stillwater', 'Impostor');


INSERT INTO Map (MapID, MapName, StartTime, EndTime) 
VALUES (1, 'The Skeld', TO_TIMESTAMP('2024-11-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-01 10:45:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Map (MapID, MapName, StartTime, EndTime) 
VALUES (2, 'MIRA HQ', TO_TIMESTAMP('2024-11-02 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-02 11:50:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Map (MapID, MapName, StartTime, EndTime) 
VALUES (3, 'Polus', TO_TIMESTAMP('2024-11-03 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-03 12:45:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Map (MapID, MapName, StartTime, EndTime) 
VALUES (4, 'Airship', TO_TIMESTAMP('2024-11-04 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-04 14:50:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Map (MapID, MapName, StartTime, EndTime) 
VALUES (5, 'TheFungle', TO_TIMESTAMP('2024-11-05 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2024-11-05 15:45:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Room (RoomName, MapID) VALUES ('Cafeteria', 1);
INSERT INTO Room (RoomName, MapID) VALUES ('Admin', 1);
INSERT INTO Room (RoomName, MapID) VALUES ('MedBay', 2);
INSERT INTO Room (RoomName, MapID) VALUES ('Electrical', 3);
INSERT INTO Room (RoomName, MapID) VALUES ('Weapons', 4);

INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Swipe Card', 'Short', 1);
INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Fix Wiring', 'Long', 2);
INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Calibrate Distributor', 'Short', 1);
INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Upload Data', 'Long', 1);
INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Align Engine Output', 'Short', 1);
INSERT INTO TaskInfo (TaskName, Length, NumRequired) VALUES ('Fix Wires', 'Long', 2);

INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (1, 'Swipe Card', 'Admin', 'F');
INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (2, 'Fix Wiring', 'Electrical', 'T');
INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (3, 'Calibrate Distributor', 'MedBay', 'F');
INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (4, 'Upload Data', 'Cafeteria', 'T');
INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (5, 'Fix Wires', 'Cafeteria', 'T');
INSERT INTO Task (TaskID, TaskName, RoomName, Complete) VALUES (6, 'Align Engine Output', 'Weapons', 'F');

INSERT INTO SabotageTypeInfo (SabotageType, Length, Cooldown) VALUES ('Lights Out', 'Short', 30);
INSERT INTO SabotageTypeInfo (SabotageType, Length, Cooldown) VALUES ('Communications Down', 'Short', 40);
INSERT INTO SabotageTypeInfo (SabotageType, Length, Cooldown) VALUES ('Oxygen Depletion', 'Short', 25);
INSERT INTO SabotageTypeInfo (SabotageType, Length, Cooldown) VALUES ('Reactor Meltdown', 'Long', 60);
INSERT INTO SabotageTypeInfo (SabotageType, Length, Cooldown) VALUES ('Doors Locked', 'Short', 20);

INSERT INTO Sabotage (SabotageID, SabotageType, RoomName) VALUES (1, 'Lights Out', 'Electrical');
INSERT INTO Sabotage (SabotageID, SabotageType, RoomName) VALUES (2, 'Communications Down', 'Admin');
INSERT INTO Sabotage (SabotageID, SabotageType, RoomName) VALUES (3, 'Oxygen Depletion', 'Cafeteria');
INSERT INTO Sabotage (SabotageID, SabotageType, RoomName) VALUES (4, 'Reactor Meltdown', 'MedBay');
INSERT INTO Sabotage (SabotageID, SabotageType, RoomName) VALUES (5, 'Doors Locked', 'Weapons');

INSERT INTO EmergencyMeeting (MeetingTime, CallerColor, DiscussionDuration) 
VALUES (TO_TIMESTAMP('2024-11-01 10:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'Red', 60);
INSERT INTO EmergencyMeeting (MeetingTime, CallerColor, DiscussionDuration) 
VALUES (TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'), 'Blue', 90);
INSERT INTO EmergencyMeeting (MeetingTime, CallerColor, DiscussionDuration) 
VALUES (TO_TIMESTAMP('2024-11-03 12:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'Green', 75);
INSERT INTO EmergencyMeeting (MeetingTime, CallerColor, DiscussionDuration) 
VALUES (TO_TIMESTAMP('2024-11-04 14:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Yellow', 85);
INSERT INTO EmergencyMeeting (MeetingTime, CallerColor, DiscussionDuration) 
VALUES (TO_TIMESTAMP('2024-11-05 15:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Cyan', 80);

INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (1, 'Lebron James my goat', TO_TIMESTAMP('2024-11-01 10:05:00', 'YYYY-MM-DD HH24:MI:SS'), 'Red');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (2, 'ong', TO_TIMESTAMP('2024-11-01 10:06:00', 'YYYY-MM-DD HH24:MI:SS'), 'Blue');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (3, 'I think its Blue.', TO_TIMESTAMP('2024-11-02 11:12:00', 'YYYY-MM-DD HH24:MI:SS'), 'Green');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (4, 'MANGOS MANGOS', TO_TIMESTAMP('2024-11-03 12:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Yellow');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (5, 'THIS my winter arc frfr', TO_TIMESTAMP('2024-11-04 14:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Cyan');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (6, 'we got rizzy amongus before GTA IV', TO_TIMESTAMP('2024-11-05 15:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Pink');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (7, 'Knee surgery tmr, wish me luck', TO_TIMESTAMP('2024-11-06 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'Purple');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (8, 'She said Its giving impostor', TO_TIMESTAMP('2024-11-06 12:10:00', 'YYYY-MM-DD HH24:MI:SS'), 'Brown');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (9, 'i went to sus town and everybody there said they knew you', TO_TIMESTAMP('2024-11-07 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Orange');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (10, 'caaaaaashhh', TO_TIMESTAMP('2024-11-07 14:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'White');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (11, 'Bro vented in 4k', TO_TIMESTAMP('2024-11-08 17:50:00', 'YYYY-MM-DD HH24:MI:SS'), 'Black');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (12, 'Mid evidence ngl', TO_TIMESTAMP('2024-11-09 11:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'Blue');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (13, 'Not the vibe frfr', TO_TIMESTAMP('2024-11-09 16:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'Red');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (14, 'Just say youre sus and move on', TO_TIMESTAMP('2024-11-10 18:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Yellow');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (15, 'Ratio + vented', TO_TIMESTAMP('2024-11-10 20:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Green');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (16, 'DO U KONW DA WAY', TO_TIMESTAMP('2024-11-11 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Pink');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (17, 'We bring the BOOM! rizzler costcoguys CHICKENBAKE DOUBLE CHOCOLATE CHUNK COOKIE', TO_TIMESTAMP('2024-11-11 13:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Cyan');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (18, 'WE WANT BRONNY', TO_TIMESTAMP('2024-11-12 07:50:00', 'YYYY-MM-DD HH24:MI:SS'), 'Orange');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (19, 'Bro hit me with the trust card', TO_TIMESTAMP('2024-11-12 11:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Brown');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (20, 'Nah but like I saw Purple', TO_TIMESTAMP('2024-11-12 14:10:00', 'YYYY-MM-DD HH24:MI:SS'), 'Purple');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (21, 'Man sus as hell', TO_TIMESTAMP('2024-11-13 09:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'Black');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (22, 'Yellow is gaslighting me', TO_TIMESTAMP('2024-11-13 12:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'White');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (23, 'It wasnt me vibes fr', TO_TIMESTAMP('2024-11-14 11:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Green');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (24, 'Catch me outside the vent, howboutdat', TO_TIMESTAMP('2024-11-14 13:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'Pink');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (25, 'Cyan has no rizz', TO_TIMESTAMP('2024-11-14 15:10:00', 'YYYY-MM-DD HH24:MI:SS'), 'Blue');
INSERT INTO Chat (ChatID, Message, Timestamp, Color) 
VALUES (26, 'Its Yellow, no printer', TO_TIMESTAMP('2024-11-15 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Yellow');

INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Red', TO_TIMESTAMP('2024-11-01 10:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'Electrical');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Yellow', 'Green', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Pink', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Cyan', 'Orange', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Black', 'Purple', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Red', TO_TIMESTAMP('2024-11-01 10:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'Electrical');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Yellow', 'Green', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Pink', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Cyan', 'Orange', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Cafeteria');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Black', 'Purple', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Weapons');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Black', 'Red', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Electrical');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Purple', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'MedBay');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Black', 'White', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'Admin');
INSERT INTO Kills (ImpostorColor, CrewmateColor, TimeOfKill, RoomName) 
VALUES ('Blue', 'Green', TO_TIMESTAMP('2024-11-02 11:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'MedBay');

INSERT INTO PlaysIn (Color, MapID) VALUES ('Red', 1);
INSERT INTO PlaysIn (Color, MapID) VALUES ('Blue', 1);
INSERT INTO PlaysIn (Color, MapID) VALUES ('Green', 2);
INSERT INTO PlaysIn (Color, MapID) VALUES ('Yellow', 3);
INSERT INTO PlaysIn (Color, MapID) VALUES ('Cyan', 4);

INSERT INTO Performs (Color, TaskID) VALUES ('Red', 1);
INSERT INTO Performs (Color, TaskID) VALUES ('Green', 2);
INSERT INTO Performs (Color, TaskID) VALUES ('Blue', 3);
INSERT INTO Performs (Color, TaskID) VALUES ('Yellow', 4);
INSERT INTO Performs (Color, TaskID) VALUES ('Cyan', 5);

INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Red', 'Blue', TO_TIMESTAMP('2024-11-01 10:15:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Red', 'Blue', TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Red', 'Blue', TO_TIMESTAMP('2024-11-03 12:20:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Yellow', 'Blue', TO_TIMESTAMP('2024-11-04 14:25:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Red', 'Blue', TO_TIMESTAMP('2024-11-05 15:30:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Green', 'Yellow', TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Pink', 'Orange', TO_TIMESTAMP('2024-11-01 10:15:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Blue', 'Green', TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Pink', 'Green', TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Blue', 'Orange', TO_TIMESTAMP('2024-11-03 12:20:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('White', 'Orange', TO_TIMESTAMP('2024-11-04 14:25:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Black', 'Blue', TO_TIMESTAMP('2024-11-05 15:30:00', 'YYYY-MM-DD HH24:MI:SS'));
INSERT INTO Votes (VoterColor, VotedColor, MeetingTime) 
VALUES ('Green', 'Orange', TO_TIMESTAMP('2024-11-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Blue', 'Electrical', 'Admin');
INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Yellow', 'Weapons', 'Cafeteria');
INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Black', 'Electrical', 'MedBay');
INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Cyan', 'MedBay', 'Cafeteria');
INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Blue', 'Admin', 'Electrical');
INSERT INTO Vented (Color, RoomName1, RoomName2) 
VALUES ('Black', 'Weapons', 'Cafeteria');