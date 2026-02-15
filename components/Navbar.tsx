/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import { css } from "@emotion/react";

interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
  description?: string;
}

// Stílusok
const menuSystem = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
`;

const desktopMenu = css`
  display: block;
  background: linear-gradient(135deg, #0a0a19 0%, #1a1a2e 50%, #16213e 100%);
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  backdrop-filter: blur(10px);
  padding: 0 2rem;
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const menuContainer = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 70px;
`;

const menuBrand = css`
  display: flex;
  align-items: center;
`;

const brandLink = css`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    color: #a855f7;
    transform: translateY(-2px);
  }
`;

const brandIcon = css`
  font-size: 1.5rem;
  margin-right: 0.5rem;
  animation: pulse 2s infinite;
`;

const brandText = css`
  background: linear-gradient(45deg, #a855f7, #4ad8eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const menuList = css`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
`;

const menuItem = css`
  position: relative;
`;

const menuLink = css`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    transform: translateY(-2px);
  }

  &[data-has-submenu="true"]:hover {
    background: rgba(168, 85, 247, 0.2);
  }
`;

const menuIcon = css`
  margin-right: 0.5rem;
  font-size: 1.1rem;
`;

const menuText = css`
  font-size: 1rem;
`;

const dropdownArrow = css`
  margin-left: 0.5rem;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
`;

const submenu = css`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(10, 10, 25, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 300px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;

  &.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const submenuContent = css`
  width: 100%;
`;

const submenuHeader = css`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
`;

const submenuTitle = css`
  color: #a855f7;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const submenuDescription = css`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
`;

const submenuList = css`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const submenuItem = css`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const submenuLink = css`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    transform: translateX(5px);
  }
`;

const submenuIcon = css`
  margin-right: 0.75rem;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
`;

const submenuText = css`
  flex: 1;
`;

const submenuName = css`
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const submenuDesc = css`
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const mobileMenu = css`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;

  @media (max-width: 768px) {
    display: block;
    background: linear-gradient(135deg, #0a0a19 0%, #1a1a2e 50%, #16213e 100%);
    border-bottom: 1px solid rgba(168, 85, 247, 0.2);
    backdrop-filter: blur(10px);
  }
`;

const mobileHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 70px;
`;

const mobileBrand = css`
  display: flex;
  align-items: center;
`;

const mobileToggle = css`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  transition: all 0.3s ease;
  position: relative;

  span {
    width: 27px;
    height: 4px;
    background: #ffffff;
    border-radius: 3px;
    transition: all 0.3s ease;
    transform-origin: center;
    display: block;
  }

  &.active span:first-child {
    transform: rotate(45deg) translate(6px, 8px);
  }

  &.active span:nth-child(2) {
    opacity: 0;
    transform: scale(0);
  }

  &.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -8px);
  }
`;

const mobileMenuContent = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 25, 0.98);
  backdrop-filter: blur(20px);
  z-index: 1000;
  transform: translateX(-100%);
  transition: all 0.3s ease;
  overflow-y: auto;
  width: 100%;
  height: 100vh;
  opacity: 0;
  box-shadow: 0 0 50px rgba(168, 85, 247, 0.3);

  &.active {
    transform: translateX(0);
    opacity: 1;
  }
`;

const mobileNavigation = css`
  padding: 4rem 2rem 2rem;
`;

const mobileMenuList = css`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const mobileMenuItem = css`
  margin-bottom: 1rem;
`;

const mobileMenuLink = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    transform: translateY(-2px);
  }
`;

const mobileSubmenuArrow = css`
  font-size: 0.8rem;
  transition: transform 0.3s ease;

  &.active {
    transform: rotate(180deg);
  }

  &.placeholder {
    visibility: hidden;
  }
`;

const mobileSubmenu = css`
  list-style: none;
  margin: 0.5rem 0 0 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  opacity: 0;
  transform: translateY(-10px);

  &.active {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }
`;

const mobileSubmenuItem = css`
  margin-bottom: 0.5rem;
`;

const mobileSubmenuLink = css`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-left: 1rem;
  width: calc(100% - 1rem);

  &:hover {
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    transform: translateX(5px);
  }
`;

const mobileMenuFooter = css`
  padding: 2rem;
  border-top: 1px solid rgba(168, 85, 247, 0.2);
  margin-top: 2rem;
`;

const socialLinks = css`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
`;

const socialLink = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 50%;
  text-decoration: none;
  color: #ffffff;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(168, 85, 247, 0.2);
    transform: translateY(-2px);
  }
`;

const contactInfo = css`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const pulse = css`
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`;

export default function NavBar() {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(
    null
  );

  const mainMenuItems: MenuItem[] = [
    {
      name: "Home",
      path: "/",
      icon: "🏠",
    },
    {
      name: "About",
      path: "/about",
      icon: "👤",
    },
    {
      name: "Contact",
      path: "/contact",
      icon: "📧",
    },
  ];

  const handleMouseEnter = (itemName: string) => {
    if (mainMenuItems.find((item) => item.name === itemName)?.hasSubmenu) {
      setActiveSubmenu(itemName);
    }
  };

  const handleMouseLeave = () => {
    setActiveSubmenu(null);
  };

  const toggleMobileMenu = () => {
    console.log("Toggle mobile menu clicked, current state:", isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleMobileSubmenu = (itemName: string) => {
    if (activeMobileSubmenu === itemName) {
      setActiveMobileSubmenu(null);
    } else {
      setActiveMobileSubmenu(itemName);
    }
  };

  return (
    <div css={menuSystem}>
      {/* Desktop Menu */}
      <nav css={desktopMenu}>
        <div css={menuContainer}>
          <div css={menuBrand}>
            <a href="/" css={brandLink}>
              <span css={brandIcon}>🚀</span>
              <span css={brandText}>AntiCode</span>
            </a>
          </div>

          <ul css={menuList}>
            {mainMenuItems.map((item, index) => (
              <li
                key={index}
                css={menuItem}
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={item.path}
                  css={menuLink}
                  data-has-submenu={item.hasSubmenu}
                >
                  {item.icon && <span css={menuIcon}>{item.icon}</span>}
                  <span css={menuText}>{item.name}</span>
                  {item.hasSubmenu && <span css={dropdownArrow}>▼</span>}
                </a>

                {/* Dropdown Submenu */}
                {item.hasSubmenu && item.submenu && (
                  <div css={[submenu, activeSubmenu === item.name && "active"]}>
                    <div css={submenuContent}>
                      <div css={submenuHeader}>
                        <h3 css={submenuTitle}>{item.name}</h3>
                        <p css={submenuDescription}>Válassz egy projektet</p>
                      </div>
                      <ul css={submenuList}>
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex} css={submenuItem}>
                            <a href={subItem.path} css={submenuLink}>
                              <span css={submenuIcon}>{subItem.icon}</span>
                              <div css={submenuText}>
                                <span css={submenuName}>{subItem.name}</span>
                                <span css={submenuDesc}>
                                  {subItem.description}
                                </span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      <nav css={mobileMenu}>
        <div css={mobileHeader}>
          <div css={mobileBrand}>
            <a href="/" css={brandLink}>
              <span css={brandIcon}>🚀</span>
              <span css={brandText}>AntiCode</span>
            </a>
          </div>
          <button
            css={mobileToggle}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            className={isMobileMenuOpen ? "active" : ""}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div
          css={mobileMenuContent}
          className={isMobileMenuOpen ? "active" : ""}
        >
          <div css={mobileNavigation}>
            <ul css={mobileMenuList}>
              {mainMenuItems.map((item, index) => (
                <li key={index} css={mobileMenuItem}>
                  {item.hasSubmenu ? (
                    <button
                      css={mobileMenuLink}
                      onClick={() => toggleMobileSubmenu(item.name)}
                    >
                      {item.icon && <span css={menuIcon}>{item.icon}</span>}
                      <span css={menuText}>{item.name}</span>
                      <span
                        css={mobileSubmenuArrow}
                        className={
                          activeMobileSubmenu === item.name ? "active" : ""
                        }
                      >
                        ▼
                      </span>
                    </button>
                  ) : (
                    <a
                      href={item.path}
                      css={mobileMenuLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon && <span css={menuIcon}>{item.icon}</span>}
                      <span css={menuText}>{item.name}</span>
                      <span css={[mobileSubmenuArrow, "placeholder"]}>
                        &nbsp;
                      </span>
                    </a>
                  )}

                  {/* Mobile Submenu */}
                  {item.hasSubmenu && item.submenu && (
                    <ul
                      css={mobileSubmenu}
                      className={
                        activeMobileSubmenu === item.name ? "active" : ""
                      }
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex} css={mobileSubmenuItem}>
                          <a
                            href={subItem.path}
                            css={mobileSubmenuLink}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem.icon && (
                              <span css={submenuIcon}>{subItem.icon}</span>
                            )}
                            <div css={submenuText}>
                              <span css={submenuName}>{subItem.name}</span>
                              <span css={submenuDesc}>
                                {subItem.description}
                              </span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div css={mobileMenuFooter}>
            <div css={socialLinks}>
              <a href="#" css={socialLink} aria-label="GitHub">
                <span>🐙</span>
              </a>
              <a href="#" css={socialLink} aria-label="LinkedIn">
                <span>💼</span>
              </a>
              <a href="#" css={socialLink} aria-label="Twitter">
                <span>🐦</span>
              </a>
            </div>
            <div css={contactInfo}>
              <p>Kapcsolat: info@anticode.com</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
