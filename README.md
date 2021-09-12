# <img src="abyss/public/favicon.png"  width="30"/> Abyss | [abyss-online.games](http://abyss-online.games/)
## What is Abyss?
Abyss is a multiplayer 2d shooter game that you can play with your friends! It includes different weapon types and items that replenish your health and ammo. Score points by eliminating enemies and crates to compete with other players on the highscore leaderboard. 

# How to install and run
1) Make sure to configure the properties depending on the system you want to host this on. Do this by changing the port in `abyss/src/config.tsx` and `server/ftd.ts` to a port of your choice.
2) Configure the database credentials in `server/ftd.ts` and `setup.sh` to connect to a postgres relational database.
4) Once you configure the application run `./setup.sh` to start the server. Enjoy!

Note: You might have to remove cors from `server/ftd.ts` depending on your situation.
# Controls
## Movement
- Cursor - Facing position
- W - Forward
- A - Backwards
- S - Strafe left
- D - Strafe right
## Actions
- E - Consume/equip item
- Leftclick - Fire weapon

# Legend
<div>
  <img style="vertical-align:middle" src="images/player.PNG" width="70">
  <span style="">A player equiped with a weapon and a health bar.</span>
</div>
<div>
  <img style="vertical-align:middle" src="images/weapon.PNG" width="70">
  <span style="">A weapon drop with a preview of its type. There are three types of weapons.</span>
</div>
<div>
  <img style="vertical-align:middle" src="images/ammo.PNG" width="70">
  <span style="">An ammo drop that replenishs all the ammo for your current weapon.</span>
</div>
<div>
  <img style="vertical-align:middle" src="images/health.PNG" width="70">
  <span style="">A health drop that replenishs all your health for.</span>
</div>
<div>
  <img style="vertical-align:middle" src="images/wall.PNG" width="70">
  <span style="">An unbreakable and solid structure.</span>
</div>
<div>
  <img style="vertical-align:middle" src="images/crate.PNG" width="70">
  <span style="">An breakable and solid structure that randomly drops a weapon type.</span>
</div>

# Contributors

This repository has multiple contributers that aided in the development of this online video game.
- Tomasz Cieslak
- Julian de Rushe   

# Notes
This project is still under development and will still continue to receiving updates in the future to improve performance and usability.
