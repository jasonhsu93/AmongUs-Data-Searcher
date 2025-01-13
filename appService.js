const oracledb = require('oracledb');
oracledb.fetchAsString = [ oracledb.CLOB ];
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// database configuration setup.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// wrapper to manage OracleDB actions
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// core functions for database operations
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(query, params, { autoCommit: true });
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteQuery(query, params = []) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(query, params, { autoCommit: true });
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

//Helper Functions for displaying tables
async function fetchPlayers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'SELECT Color, PlayerName, Role FROM Player'
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error fetching players:", err);
        return [];
    });
}

async function fetchKills() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            'SELECT ImpostorColor, CrewmateColor, TimeOfKill, RoomName FROM Kills',
        );
        return result.rows;
    }).catch((err) => {
        console.error("Error fetching kills:", err);
        return [];
    });
}

//Query functions

//INSERT done on Chat
async function insertChat(chatID, message, playerColor) {
    console.log("inserting!");

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');  
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');


    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return await executeQuery(
        `INSERT INTO Chat (ChatID, Message, Timestamp, Color) VALUES (:chatID, :message, TO_TIMESTAMP(:timestamp, 'YYYY-MM-DD HH24:MI:SS'), :playerColor)`,
        [chatID, message, timestamp, playerColor]
    );
}

//Insert Players, not actual Insert implementation
async function insertPlayer(color, playerName, role) {
    return await executeQuery(
        `INSERT INTO Player (Color, PlayerName, Role) VALUES (:color, :playerName, :role)`,
        [color, playerName, role]
    );
}

//UPDATE done on Player
async function updatePlayer(color, newPlayerName, newRole) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `UPDATE Player
                 SET PlayerName = NVL(:newPlayerName, PlayerName),
                     Role = NVL(:newRole, Role)
                 WHERE Color = :color`,
                [newPlayerName, newRole, color],
                { autoCommit: true }
            );
            return { success: result.rowsAffected > 0 };
        } catch (err) {
            console.error("Error updating player:", err);
            return { success: false, error: err.message };
        }
    });
}

//DELETE done on Player
async function deletePlayerByColor(color) {
    return await deleteQuery(
        `DELETE FROM Player WHERE Color = :color`,
        [color]
    );
    return result;
}

//SELECTION done on Chat
async function selectChat(filters, logic) {
    return await withOracleDB(async (connection) => {
        try {
            const whereConditions = [];
            const params = {};
            const joinOperators = [];

            if (filters.ChatID && filters.ChatID !== "") {
                whereConditions.push('ChatID = :ChatID');
                params.ChatID = filters.ChatID;
                joinOperators.push(logic.ChatID || "AND");
            }

            if (filters.Message && filters.Message !== "") {
                whereConditions.push('UPPER(Message) LIKE UPPER(:Message)');
                params.Message = `%${filters.Message}%`;
                joinOperators.push(logic.Message || "AND");
            }

            if (filters.Timestamp && filters.Timestamp !== "") {
                whereConditions.push('Timestamp = TO_DATE(:Timestamp, \'YYYY-MM-DD"T"HH24:MI\')');
                params.Timestamp = filters.Timestamp;
                joinOperators.push(logic.Timestamp || "AND");
            }

            if (filters.Color && filters.Color !== "") {
                whereConditions.push('UPPER(Color) = UPPER(:Color)');
                params.Color = filters.Color;
                joinOperators.push(logic.Color || "AND");
            }


            const query = `
                SELECT ChatID, Message, Timestamp, Color
                FROM Chat
                ${whereConditions.length > 0
                    ? 'WHERE ' + whereConditions.map((condition, i) =>
                        i === 0 ? condition : `${joinOperators[i - 1]} ${condition}`
                      ).join(' ')
                    : ''}
            `; 

            console.log("Generated Query:", query);  
            console.log("Parameters:", params);   

            const result = await connection.execute(query, params);
            console.log("Query Result:", result.rows); 
            return result.rows;
        } catch (err) {
            console.error('Error executing selectChat query:', err);
            throw err;
        }
    });
}
 
//PROJECTION done on Task
async function fetchTasksWithProjection(attributes) {
    return await withOracleDB(async (connection) => {

        const validAttributes = ['TaskID', 'TaskName', 'RoomName', 'Complete'];
        const selectedAttributes = attributes.filter(attr => validAttributes.includes(attr));

        if (selectedAttributes.length === 0) {
            throw new Error('No valid attributes selected');
        }

        const columns = selectedAttributes.join(', ');

        const query = `SELECT ${columns} FROM Task`;

        console.log("Generated Query:", query); 

        const result = await connection.execute(query);

        return result.rows;
    }).catch((err) => {
        console.error("Error fetching tasks with projection:", err);
        throw err;
    });
}

//JOIN query
async function fetchImpostorsAndKillsByColor(color) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT CrewmateColor, TimeOfKill 
             FROM Kills 
             JOIN Player ON Kills.ImpostorColor = Player.Color 
             WHERE Player.Role = 'Impostor' AND Kills.ImpostorColor = :color`,
            [color] 
        );
        console.log(result.rows);
        return result.rows; 
    }).catch((error) => {
        console.error("Error fetching impostor kills by color:", error);
        return []; 
    });
}

//AGGREGATION GROUP BY done on Task
async function groupTasksByRoom() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT RoomName, COUNT(*) AS TaskCount 
             FROM Task 
             GROUP BY RoomName`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

//AGGREGATION HAVING done on Task
async function tasksWithMultipleRooms() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT RoomName, COUNT(*) AS TaskCount 
             FROM Task 
             GROUP BY RoomName 
             HAVING COUNT(*) > 1`
        );
        return result.rows;
    }).catch(() => {
        return [];
    });
}

//NESTED AGGREGATION GROUP BY done on Kills
async function findTopImpostors() {
    return await withOracleDB(async (connection) => {
        const query = `
            SELECT k.ImpostorColor, COUNT(*) AS KillCount
            FROM Kills k
            GROUP BY k.ImpostorColor
            HAVING COUNT(*) > (
                SELECT AVG(KillCount)
                FROM (
                    SELECT ImpostorColor, COUNT(*) AS KillCount
                    FROM Kills
                    GROUP BY ImpostorColor
                )
            )
        `;
        const result = await connection.execute(query);
        return result.rows;
    }).catch((err) => {
        console.error("Error finding top impostors:", err);
        throw err;
    });
}

//DIVISION done on Player and EmergencyMeeting
async function playersCompletedAllTasks() {
    return await withOracleDB(async (connection) => {
        const query = `SELECT DISTINCT p.Color, p.PlayerName
        FROM Player p
        WHERE NOT EXISTS (
            SELECT em.MeetingTime 
            FROM EmergencyMeeting em
            WHERE NOT EXISTS (
                SELECT 1 
                FROM Votes v 
                WHERE v.VotedColor = p.Color 
                AND v.MeetingTime = em.MeetingTime
            )
        )`;
        const result = await connection.execute(query);

        console.log("Generated Query:", query);
        console.log("Query Result:", result.rows); 
        return result.rows;
    }).catch(() => {
        return [];
    });
}

module.exports = {
    testOracleConnection,
    fetchImpostorsAndKillsByColor,
    groupTasksByRoom,
    tasksWithMultipleRooms,
    playersCompletedAllTasks,
    fetchPlayers,
    insertPlayer,
    deletePlayerByColor,
    fetchTasksWithProjection,
    fetchKills,
    updatePlayer,
    selectChat,
    insertChat,
    findTopImpostors
};