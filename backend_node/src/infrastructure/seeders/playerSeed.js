// Seed data untuk players
async function seedPlayers(playerService) {
  const GUEST_PLAYER = {
    id: 'Guest_Player',
    username: 'Guest_Player',
    email: 'guest@stellargames.com',
    displayName: 'World Challenger',
    status: 'active'
  };

  try {
    const existing = await playerService.getPlayerById(GUEST_PLAYER.id);
    if (!existing) {
      await playerService.createPlayer(GUEST_PLAYER);
      console.log('✅ Created default Guest_Player');
    }
  } catch (error) {
    console.log('🔄 Guest_Player already exists or error:', error.message);
  }
}

module.exports = { seedPlayers };
