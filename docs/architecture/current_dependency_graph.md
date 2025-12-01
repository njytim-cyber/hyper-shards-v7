# Current Dependency Graph

```mermaid
graph TD
    subgraph App
        App --> GameCanvas
        App --> HUD
        App --> StartScreen
        App --> GameOverScreen
        App --> PauseScreen
        App --> ShopScreen
        App --> GameEngine
        App --> Persistence
        App --> AudioSystem
    end

    subgraph Core
        GameEngine --> Ship
        GameEngine --> Bullet
        GameEngine --> Asteroid
        GameEngine --> Particle
        GameEngine --> FloatingText
        GameEngine --> PowerUp
        GameEngine --> Boss
        GameEngine --> Pool
        GameEngine --> SpriteCache
        GameEngine --> AudioSystem
        GameEngine --> Persistence
        GameEngine --> InputSystem
        GameEngine --> TutorialSystem
    end

    subgraph Systems
        TutorialSystem --> GameEngine
        Persistence
        AudioSystem
        InputSystem
        SpriteCache
    end

    subgraph Entities
        Ship --> Bullet
        Boss --> Bullet
        Asteroid
        Particle
        FloatingText
        PowerUp
    end
```
