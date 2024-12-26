const App = {
    data() {
      return {
        activeIndex: 0,
        list: [
          {
            name: "Brimstone",
            role: "CONTROLLER",
            desc:
              "Joining from the USA, Brimstone's orbital arsenal ensures his squad always has the advantage. His ability to deliver utility precisely and from a distance make him an unmatched boots-on-the-ground commander.",
            img:
              "../agents/img/brimstone-fondo.jpg",
            thumbImg:
              "../agents/img/brim.jfif"
          },
          {
            name: "Killjoy",
            role: "SENTINEL",
            desc:
              "The genius of Germany. Killjoy secures the battlefield with ease using her arsenal of inventions. If the damage from her gear doesn't stop her enemies, her robots' debuff will help make short work of them.",
            img:
              "../agents/img/killjoy-fondo.jpg",
            thumbImg:
              "../agents/img/killjoy.jfif"
          },
          {
            name: "neon",
            role: "DUELIST",
            desc:
              "Filipino Agent Neon surges forward at shocking speeds, discharging bursts of bioelectric radiance as fast as her body generates it. She races ahead to catch enemies off guard, then strikes them down quicker than lightning.",
            img:
              "../agents/img/neon-fondo.jpg",
            thumbImg:
              "../agents/img/neon.png"
          },
          {
            name: "phoenix",
            role: "DUELIST",
            desc:
              "Hailing from the U.K., Phoenix's star power shines through in his fighting style, igniting the battlefield with flash and flare. Whether he's got backup or not, he'll rush into a fight on his own terms.",
            img:
              "../agents/img/phoenix-fondo.jpg",
            thumbImg:
              "../agents/img/phoenix.png"
          },
          {
            name: "Sage",
            role: "SENTINEL",
            difficulty: "moderate",
            desc:
              "The stronghold of China, Sage creates safety for herself and her team wherever she goes. Able to revive fallen friends and stave off aggressive pushes, she provides a calm center to a hellish fight.",
            img:
              "../agents/img/sage-fondo.jpg",
            thumbImg:
              "https://valorantinfo.com/images/mx/sage_valorant_icon_2252.webp"
          },
          {
            name: "Sova",
            role: "INITIATOR",
            desc:
              "Born from the eternal winter of Russia's tundra, Sova tracks, finds, and eliminates enemies with ruthless efficiency and precision. His custom bow and incredible scouting abilities ensure that even if you run, you cannot hide.",
            img:
              "../agents/img/sova-fondo.jpg",
            thumbImg:
              "../agents/img/sova.jfif"
          },
          {
            name: "Viper",
            role: "CONTROLLER",
            desc:
              "The American chemist, Viper deploys an array of poisonous chemical devices to control the battlefield and cripple the enemy's vision. If the toxins don't kill her prey, her mind games surely will.",
            img:
              "../agents/img/viper-fondo.jpg",
            thumbImg:
              "../agents/img/viper.png"
          },
          {
            name: "Cypher",
            role: "SENTINEL",
            desc:
              "The Moroccan information broker, Cypher is a one-man surveillance network who keeps tabs on the enemy's every move. No secret is safe. No maneuver goes unseen. Cypher is always watching.",
            img:
              "../agents/img/chyper-fondo.jpg",
            thumbImg:
              "../agents/img/cypher.png"
          },
          {
            name: "Reyna",
            role: "DUELIST",
            desc:
              "Forged in the heart of Mexico, Reyna dominates single combat, popping off with each kill she scores. Her capability is only limited by her raw skill, making her highly dependent on performance.",
            img:
              "../agents/img/reyna-fondo.jpg",
            thumbImg:
              "../agents/img/reyna.jfif"
          },
          {
            name: "Breach",
            role: "INITIATOR",
            desc:
              "Breach, the bionic Swede, fires powerful, targeted kinetic blasts to aggressively clear a path through enemy ground. The damage and disruption he inflicts ensures no fight is ever fair.",
            img:
              "../agents/img/breach-fondo.jpg",
            thumbImg:
              "../agents/img/breach.png"
          },
          {
            name: "omen",
            role: "CONTROLLER",
            desc:
              "A phantom of a memory, Omen hunts in the shadows. He renders enemies blind, teleports across the field, then lets paranoia take hold as his foe scrambles to learn where he might strike next.",
            img:
              "../agents/img/omen-fondo.jpg",
            thumbImg:
              "../agents/img/omen.png"
          },
          {
            name: "Jett",
            role: "DUELIST",
            desc:
              "Representing her home country of South Korea, Jett's agile and evasive fighting style lets her take risks no one else can. She runs circles around every skirmish, cutting enemies before they even know what hit them.",
            img:
              "../agents/img/jett-fondo.jpg",
            thumbImg:
              "../agents/img/jett.png"
          },
          {
            name: "Raze",
            role: "DUELIST",
            desc:
              "Raze explodes out of Brazil with her big personality and big guns. With her blunt-force-trauma playstyle, she excels at flushing entrenched enemies and clearing tight spaces with a generous dose of “boom.",
            img:
              "../agents/img/raze-fondo.jpg",
            thumbImg:
              "../agents/img/raze.png"
          },
          {
            name: "Skye",
            role: "INITIATOR",
            desc:
              "Hailing from Australia, Skye and her band of beasts trail-blaze the way through hostile territory. With her creations hampering the enemy, and her power to heal others, the team is strongest and safest by Skye’s side.",
            img:
              "../agents/img/skye-fondo.jpg",
            thumbImg:
              "../agents/img/skye.png"
          },
          {
            name: "yoru",
            role: "DUELIST",
            desc:
              "Japanese native, Yoru, rips holes straight through reality to infiltrate enemy lines unseen. Using deception and aggression in equal measure, he gets the drop on each target before they know where to look.",
            img:
              "../agents/img/yoru-fondo.jpg",
            thumbImg:
              "../agents/img/yoru.png"
          },
          {
            name: "astra",
            role: "CONTROLLER",
            desc:
              "Ghanaian Agent Astra harnesses the energies of the cosmos to reshape battlefields to her whim. With full command of her astral form and a talent for deep strategic foresight, she's always eons ahead of her enemy's next move.",
            img:
              "../agents/img/astra-fondo.png",
            thumbImg:
              "../agents/img/astra.png"
          },
          {
            name: "KAY/O",
            role: "INITIATOR",
            desc:
              "KAY/O is a machine of war built for a single purpose: neutralizing radiants. His power to suppress enemy abilities cripples his opponents' capacity to fight back, securing him and his allies the ultimate edge.",
            img:
              "../agents/img/kayo-fondo.png",
            thumbImg:
              "../agents/img/kayo.png"
          },
          {
            name: "Chamber",
            role: "SENTINEL",
            desc:
              "Well dressed and well armed, French weapons designer Chamber expels aggressors with deadly precision. He leverages his custom arsenal to hold the line and pick off enemies from afar, with a contingency built for every plan.",
            img:
              "../agents/img/chamber-fondo.png",
            thumbImg:
              "../agents/img/chamber.png"
          },
          {
            name: "Fade",
            role: "INITIATOR",
            desc:
              "Turkish bounty hunter, Fade, unleashes the power of raw nightmares to seize enemy secrets. Attuned with terror itself, she hunts targets and reveals their deepest fears—before crushing them in the dark.",
            img:
              "../agents/img/fade-fondo.jpeg",
            thumbImg:
              "../agents/img/fade.png"
          }
        ]
      };
    },
    computed: {
      activeInfo() {
        if (!this.list.length) return null;
        return this.list[this.activeIndex];
      },
      itemPosition() {
        const len = this.list.length;
        return this.list.map((_, key) => {
          const deg = (360 / len) * key - 90;
          const radius = "2rem";
          return `rotate(${deg}deg) translate(${radius}) rotate(${-deg}deg)`;
        });
      }
    }
  };
  
  Vue.createApp(App).mount("#app");
  