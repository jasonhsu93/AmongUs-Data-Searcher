const express = require('express');
const appService = require('./appService');

const router = express.Router();



// ----------------------------------------------------------
// API endpoints
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/players', async (req, res) => {
    const players = await appService.fetchPlayers();
    res.json(players);
});

router.post('/players', async (req, res) => {
    const { color, playerName, role } = req.body;
    try {
        const success = await appService.insertPlayer(color, playerName, role);
        res.json({ message: success ? 'Player inserted successfully' : 'Player inserted successfully' });
    } catch (error){
        console.error("error inserting player: " + error);
        res.status(500).json({ success: false, error: "Failed to insert player" });
    }
});

router.delete('/players/:color', async (req, res) => {
    const { color } = req.params;

    try {
        const result = await appService.deletePlayerByColor(color);
        if (result.rowsAffected > 0) {
            res.json({ message: 'Player deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Player not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting player: ' + error.message, error: error.message });
    }
});

router.get('/kills', async (req, res) => {
    const kills = await appService.fetchKills();
    res.json(kills);
});

router.get('/impostors-kills/:color', async (req, res) => {
    const { color } = req.params;
    const data = await appService.fetchImpostorsAndKillsByColor(color);
    res.json({ data });
});

router.get('/tasks-grouped-by-room', async (req, res) => {
    const data = await appService.groupTasksByRoom();
    res.json({ data });
});

router.get('/tasks-multiple-rooms', async (req, res) => {
    const data = await appService.tasksWithMultipleRooms();
    res.json({ data });
});

router.get('/players-completed-all-tasks', async (req, res) => {
    const data = await appService.playersCompletedAllTasks();
    res.json({ data });
});

router.post('/tasks', async (req, res) => {
    const { attributes } = req.body;
    if (!attributes || attributes.length === 0) {
        res.status(400).json({ error: 'No attributes selected' });
        return;
    }
    try {
        const tasks = await appService.fetchTasksWithProjection(attributes);
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks with projection:", error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/players/update', async (req, res) => {
    const { color, newPlayerName, newRole } = req.body;

    const result = await appService.updatePlayer(color, newPlayerName, newRole);
    if (result.success) {
        res.json({ success: true, message: "Player updated successfully" });
    } else {
        res.status(500).json({ success: false, error: result.error || "Update failed" });
    }
});

router.post('/select-chat', async (req, res) => {
    const { filters, logic } = req.body;

    try {
        const results = await appService.selectChat(filters, logic);
        if (results && Array.isArray(results)) {
            res.json(results);
        } else {
            res.status(404).json({ error: "No results found" });
        }
    } catch (error) {
        console.error("Error executing selectChat query:", error);
        res.status(500).json({ error: "Failed to execute query" });
    }
});

router.post("/chat", async (req, res) => {
    const { chatID, message, playerColor } = req.body;
    console.log("reached APP CONTROLLER (166)");

    if (!chatID || !message || !playerColor) {
        console.log("error error no valid fields");
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        console.log("insertChat called from app controller!!!");
        const result = await appService.insertChat(chatID, message, playerColor);
        res.json({ message: result ? 'Message inserted successfully' : 'Message inserted successfully' });
    } catch (error) {
        console.error("Error handling chat insert:", error);
        res.status(500).json({ success: false, error: "Failed to insert message" });
    }
});

router.get('/top-impostors', async (req, res) => {
    try {
        const data = await appService.findTopImpostors();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve top impostors' });
    }
});

module.exports = router;